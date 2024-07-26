import { json } from '@remix-run/node';
import axios from 'axios';
import { render } from "@react-email/render";
import nodemailer from "nodemailer";

export async function action({ request }) {
    const { customerId, giftCardCode, orderAmount, customerEmail } = await request.json();

    const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 465,
        secure: true,
        auth: {
            user: "salman.elsner@gmail.com",
            pass: "qejhgkkrptmfjjlc",
        },
    });

    try {
        const options = {
            from: "salman.elsner@gmail.com",
            to: `"${customerEmail}"`,
            subject: `Repeat Your Order`,
            html: `
                <h1>Hi there!</h1>
            `,
        };
        await transporter.sendMail(options);
        return "success";
    } catch (error) {
        console.error("Failed to send mail", error);
        return "failed";
    }


}
