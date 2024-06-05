import nodemailer from "nodemailer"
import pug from "pug"

const transporter = nodemailer.createTransport({
    port: 587,
    host: "live.smtp.mailtrap.io",
    auth: {
        user: 'api',
        pass: '23dc04e37aaefbe451dd3ae6714ca3dd',
    }
})

export const sendBookingMail = async ( pugTemplatePath ) => {
    const emailData = {
        subject: "You Have New Booking!",
        text: "Please visit webiste ",
        message: "Contact customer if you want to change any of the plans about the tour.",
        receiver: {
          name: "Tour Operator"
        }
      };
    const compiledFunction = pug.compileFile(pugTemplatePath);
    
    const emailHTML = compiledFunction(emailData);
    const mailData = {
        from: 'Explorer@demomailtrap.com',
        to: "nasim.limenzy@gmail.com",
        subject: "New Booking Added",
        // text: "You have new Booking for a tour / activity",
        html: emailHTML,
    };

    transporter.sendMail(mailData, (error, info) => {
        if (error) {
            return console.log(error);
        }
        res.status(200).send({ message: "Mail send", message_id: info.messageId });
    });
} 

export const sendCancelBookingMail = async (pugTemplatePath ) => {
    const emailData = {
        subject: "Your booking was cancelled!",
        text: "Please visit webiste or contact tour operator for",
        message: "Contact tour operator if you want to change any of the plans about the tour.",
        receiver: {
          name: "Customer"
        }
      };
    const compiledFunction = pug.compileFile(pugTemplatePath);

    const emailHTML = compiledFunction(emailData);
    const mailData = {
        from: 'Explorer@demomailtrap.com',
        to: "nasim.limenzy@gmail.com",
        subject: "Your Booking Cancelled",
        // text: "You have new Booking for a tour / activity",
        html: emailHTML,
    };


    transporter.sendMail(mailData, (error, info) => {
        if (error) {
            return console.log(error);
        }
        res.status(200).send({ message: "Mail send", message_id: info.messageId });
    });
} 

export const sendApproveMail = async (pugTemplatePath) => {
    const emailData = {
    subject: "Your booking was Approved!",
    text: "Please visit webiste or contact tour operator for",
    message: "Contact tour operator if you want to change any of the plans about the tour.",
    receiver: {
      name: "Customer"
    }
  };
const compiledFunction = pug.compileFile(pugTemplatePath);

const emailHTML = compiledFunction(emailData);
    const mailData = {
        from: 'Explorer@demomailtrap.com',
        to: "nasim.limenzy@gmail.com",
        subject: "Your Booking Approved By Tour Operator",
        // text: "",
        html: emailHTML,
        attachments: [
            {   // file on disk as an attachment
                filename: 'favicon.png',
                path: './services/Resources/favicon.png'
            },
            {   // file on disk as an attachment
                filename: 'text_file.txt',
                path: './services/Resources/text_file.txt'
            }
        ]
    };

    transporter.sendMail(mailData, (error, info) => {
        if (error) {
            return console.log(error);
        }
        res.status(200).send({ message: "Mail send", message_id: info.messageId });
    });
}