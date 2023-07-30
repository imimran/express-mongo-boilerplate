export const addPagination = (page, limit) => {
  if (!page || page < 1) {
    page = 1;
  }

  if (!limit || limit < 1) {
    limit = process.env.PAGINATION_DOCUMENT_LIMIT;
  }

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  return [
    {
      $facet: {
        metadata: [{ $count: "total" }],
        result: [{ $skip: startIndex }, { $limit: limit }],
      },
    },
    {
      $project: {
        result: 1,
        total: { $arrayElemAt: ["$metadata.total", 0] },
        previous:
          startIndex > 0
            ? {
                page: { $literal: page - 1 },
                limit: { $literal: limit },
              }
            : undefined,
        current: {
          page: { $literal: page },
          limit: { $literal: limit },
        },
        next: {
          $cond: {
            if: {
              $lt: [
                endIndex,
                {
                  $arrayElemAt: ["$metadata.total", 0],
                },
              ],
            },
            then: {
              page: { $literal: page + 1 },
              limit: { $literal: limit },
            },
            else: undefined,
          },
        },
      },
    },
  ];
};
export const paginatedResult = ({
  model,
  filter,
  selectField,
  populate,
  group = {},
  custom_pipeline = {},
  page,
  limit,
  sort,
}) => {
  try {
    if (!page || page < 1) {
      page = 1;
    }

    if (!limit || limit < 1) {
      limit = process.env.PAGINATION_DOCUMENT_LIMIT;
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const query = [];

    if (typeof filter === "object") {
      query.push({ $match: filter });
    }

    if (
      typeof selectField === "object" &&
      Object.keys(selectField).length > 0
    ) {
      query.push({ $project: selectField });
    }

    if (Array.isArray(populate) && populate.length > 0) {
      populate.forEach((condition) => {
        if (
          typeof condition === "object" &&
          Object.keys(condition).length > 0
        ) {
          // {
          //   foreignModel: "users", // <collection to fetch data>
          //   foreignModelField: "_id", // <field from the documents of the "from" collection>
          //   keyToPopulate: "user_id", // <field from the input documents>
          //   filter: { createdAt: { $gt: new Date() }}, (optional) // condition to populate
          //   selectField: { fullName: 1 }, (optional) // select field from foreign model
          //   renameKey: "user_info", // <output array field>
          //   single: true, (optional) // make user_info --> object (not Array)
          // }
          let match = {};

          if (condition.multiple) {
            if (
              typeof condition.selectField === "object" &&
              Object.keys(condition.selectField).length > 0
            ) {
              match = {
                $expr: {
                  $in: [`$${condition.foreignModelField}`, "$$keyToPopulate"],
                },
              };
            }
            if (
              typeof condition.filter === "object" &&
              Object.keys(condition.filter).length > 0
            ) {
              match = {
                $expr: {
                  $in: [`$${condition.foreignModelField}`, "$$keyToPopulate"],
                },
                ...condition.filter,
              };
            }
          } else {
            if (
              typeof condition.selectField === "object" &&
              Object.keys(condition.selectField).length > 0
            ) {
              match = {
                $expr: {
                  $eq: [`$${condition.foreignModelField}`, "$$keyToPopulate"],
                },
              };
            }
            if (
              typeof condition.filter === "object" &&
              Object.keys(condition.filter).length > 0
            ) {
              match = {
                $expr: {
                  $eq: [`$${condition.foreignModelField}`, "$$keyToPopulate"],
                },
                ...condition.filter,
              };
            }
          }

          if (Object.keys(match).length > 0) {
            const pipeline = [
              {
                $match: match,
              },
            ];
            if (
              typeof condition.selectField === "object" &&
              Object.keys(condition.selectField).length > 0
            ) {
              pipeline.push({
                $project: condition.selectField,
              });
            }
            query.push({
              $lookup: {
                from: condition.foreignModel,
                let: {
                  keyToPopulate: `$${condition.keyToPopulate}`,
                },
                pipeline,
                as: condition.renameKey,
              },
            });
            if (condition.single) {
              query.push({
                $unwind: `$${condition.renameKey}`,
              });
            }
          } else {
            query.push({
              $lookup: {
                from: condition.foreignModel,
                localField: condition.keyToPopulate,
                foreignField: condition.foreignModelField,
                as: condition.renameKey,
              },
            });
            if (condition.single) {
              query.push({
                $unwind: `$${condition.renameKey}`,
              });
            }
          }
        }
      });
    }

    if (typeof group === "object" && Object.keys(group).length > 0) {
      // {
      //   groupBy: "survey_participant_id", // required
      //   accumulator: { // optional
      //     fieldName: "total_response", // required
      //     operator: { $sum: 1 } // required
      //   },
      //   addField: ["survey_id"] //optional
      // }
      const groupCond = { _id: `$${group.groupBy}` };

      if (
        typeof group.accumulator === "object" &&
        Object.keys(group.accumulator).length === 2
      ) {
        groupCond[group.accumulator.fieldName] = group.accumulator.operator;
      }

      if (Array.isArray(group.addField) && group.addField.length > 0) {
        for (let j = 0; j < group.addField.length; j++) {
          const fieldName = group.addField[j];
          if (fieldName !== group.groupBy) {
            groupCond[fieldName] = {
              $first: `$${fieldName}`,
            };
          }
        }
      }

      query.push({
        $group: {
          ...groupCond,
          [group.groupBy]: {
            $first: `$${group.groupBy}`,
          },
        },
      });
      query.push({ $unset: "_id" });
    }

    if (
      typeof custom_pipeline === "object" &&
      Object.keys(custom_pipeline).length > 0
    ) {
      query.push(custom_pipeline);
    }

    if (typeof sort === "object" && Object.keys(sort).length > 0) {
      query.push({ $sort: sort });
    }
    query.push(
      {
        $facet: {
          metadata: [{ $count: "total" }],
          result: [{ $skip: startIndex }, { $limit: limit }],
        },
      },
      {
        $project: {
          result: 1,
          total: { $arrayElemAt: ["$metadata.total", 0] },
          previous:
            startIndex > 0
              ? {
                  page: { $literal: page - 1 },
                  limit: { $literal: limit },
                }
              : undefined,
          current: {
            page: { $literal: page },
            limit: { $literal: limit },
          },
          next: {
            $cond: {
              if: {
                $lt: [
                  endIndex,
                  {
                    $arrayElemAt: ["$metadata.total", 0],
                  },
                ],
              },
              then: {
                page: { $literal: page + 1 },
                limit: { $literal: limit },
              },
              else: undefined,
            },
          },
        },
      },
    );

    return model.aggregate(query);
  } catch (e) {
    return [
      {
        error: e.message,
      },
    ];
  }
};
