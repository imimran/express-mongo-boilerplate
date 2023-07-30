export const emailTemplate = (body, subject) => {
  const template = `
        <!DOCTYPE html>
        <html>
            <head>
                <style>
                body {
                    background-color: #f6f6f6;
                    font-family: sans-serif;
                    -webkit-font-smoothing: antialiased;
                    font-size: 14px;
                    line-height: 1.4;
                    margin: 0;
                    padding: 0;
                    -ms-text-size-adjust: 100%;
                    -webkit-text-size-adjust: 100%;
                  }
                  .container {
                    display: block;
                    background-color: #fff;
                    margin: 0 auto !important;
                    /* makes it centered */
                    max-width: 800px;
                    width: 100%;
                  }
                  .header {
                    border-collapse: collapse;
                    text-align: center;
                    color: #0c87b9;
                    font-size: 16px;
                    font-weight: 700;
                    padding: 10px 15px;
                    /* background-color: #e6f0f9; */
                  }
                  .logo {
                    padding: 20px;
                    text-align: center;
                    background-color: #0d6efd;
                  }
                  img {
                    width: 18%;
                  }
                  .wapper {
                    padding: 25px;
                  }
                  .footer {
                    border-collapse: collapse;
                    width: 100%;
                    text-align: center;
                    background-color: #0d6efd;
                    color: #fff;
                    font-size: 13px;
                    padding: 5px 0;
                    border-radius: 0px 0px 5px 5px;
                  }
                  
                </style>
            </head>
            <body>
            <div class="container">
                <div class="logo">
                   
                </div>
                <div class="header">
                   <h4> ${subject}</h4>
                </div>
            
                    <div class="wapper"> ${body} </div>
                <div class="footer">
                    <p>Copyright © Survey360  2022. All Rights Reserved.<p>
                </div>
                </div>
            </body>
        </html>`;
  return template;
};
