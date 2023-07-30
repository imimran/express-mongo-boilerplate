import EmailTemplate from "../models/EmailTemplate.js";

(async () => {
  const emailTemplates = [];

  const existingEmailTemplateDocs = await EmailTemplate.find({}).select("name");

  const existingEmailTemplates = existingEmailTemplateDocs.map((d) => d.name);

  if (!existingEmailTemplates.includes("registration_verification")) {
    emailTemplates.push({
      variables: ["url", "linkText", "fullName"],
      status: true,
      name: "registration_verification",
      subject: "Verify Your Email Address",
      content: `<section>
      <p>Dear <%= fullName %>,<br/>
      Your new account in Survey360 was successfully created. <br/>  Congratulations! In order to finalize your registration, we need a few more details from you, including a verification of the email address that you have provided.</br>
      <button  style="
                  margin-top: 10px;
                  border: none;
                  padding: 10px 15px;
                  text-align: center;
                  background-color: #0c87b9;
                  font-family: Helvetica, Arial, sans-serif;
                  font-size: 14px;
                  color: #ffffff; 
                  text-decoration: none;
                  border-radius: 3px;
                "><a style="color: #ffffff; 
                  text-decoration: none;" href="<%= url %>"><%= linkText %></a></button> <br />
       <br />
       Or copy and paste the URL into your browser: <br />
       <a href="<%= url %>"> <%= url %></a><br />
      </p>
      Thank you.<br/>
      <a href="https://https://survey360.xyz/">Survey360</a>
      </section>`,
    });
  }
  if (!existingEmailTemplates.includes("registration_successful")) {
    emailTemplates.push({
      variables: ["setPassword", "userName"],
      status: true,
      name: "registration_successful",
      subject: "User account create",
      content: `
      <section>
      Hello <%= userName %>,<br/>
<p>Welcome to Survey360! We can't wait for you to start using survey360 in your company or organization and see the results. </p><br/>
<p>Your account was created successfully. Your temporary password is <b><%= setPassword %></b>. Please change your password for security purposes.
Simply go here <a href="<%= url %>"> <%= url %></a> to get started, or visit our Help Center.</p> <br/>
<p>As always, our support team can be reached at <b>support@survey360.xyz </b> if you ever get stuck. </p> </bt>
Have a great day! Thank you and welcome onboard! </br>
Survey360 team
      </section>`,
    });
  }
  if (!existingEmailTemplates.includes("forgot_password")) {
    emailTemplates.push({
      variables: ["url", "linkText", "fullName"],
      status: true,
      name: "forgot_password",
      subject: "Reset Your Password",
      content: `<section> 
      <p>Dear <%= fullName%>,<br/>
       Forgot your password? <br/>
      We have received a request to reset the password that is associated with your account.<br/>
      To reset your password, either click on the button below.</br>
      <button  style="
                  margin-top: 10px;
                  border: none;
                  padding: 10px 15px;
                  text-align: center;
                  background-color: #0c87b9;
                  font-family: Helvetica, Arial, sans-serif;
                  font-size: 14px;
                  color: #ffffff; 
                  text-decoration: none;
                  border-radius: 3px;
                "><a style="color: #ffffff; 
                  text-decoration: none;" href="<%= url %>"><%= linkText %></a></button> <br /> <br />
     copy the following URL and paste it into your browser's address bar: <br/>
       <a href="<%= url %>"> <%= url %></a><br /></p>
      Thank you.<br/>
      <a href="https://https://survey360.xyz/">Survey360</a>
       </section>`,
    });
  }
  if (!existingEmailTemplates.includes("re_verification")) {
    emailTemplates.push({
      variables: ["url", "linkText", "fullName"],
      status: true,
      name: "re_verification",
      subject: "Re-Verify Your Email Address",
      content: `<section>
      <p>Dear <%= fullName %>,<br/>
      Congratulations! In order to finalize your registration, we need a few more details from you, including a verification of the email address that you have provided.</br>
      <button  style="
                  margin-top: 10px;
                  border: none;
                  padding: 10px 15px;
                  text-align: center;
                  background-color: #0c87b9;
                  font-family: Helvetica, Arial, sans-serif;
                  font-size: 14px;
                  color: #ffffff; 
                  text-decoration: none;
                  border-radius: 3px;
                "><a style="color: #ffffff; 
                  text-decoration: none;" href="<%= url %>"><%= linkText %></a></button> <br />
       <br />
       Or copy and paste the URL into your browser: <br />
       <a href="<%= url %>"> <%= url %></a><br />
      </p>
      Thank you.<br/>
      <a href="https://https://survey360.xyz/">Survey360</a>
      </section>`,
    });
  }

  if (emailTemplates.length > 0) {
    EmailTemplate.insertMany(emailTemplates);
  }
})();
