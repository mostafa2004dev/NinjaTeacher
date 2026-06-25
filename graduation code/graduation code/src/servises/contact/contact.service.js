// contact.service.js — أُعيدت كتابته بعد تلف RAR
// useContact.js يستورد sendContactMessage ويستخدمها كـ mutationFn
import axios from "axios";

const CONTACT_API = "http://localhost:3000/contact";

export async function sendContactMessage(data) {
  // data: { name, email, subject, message }
  const res = await axios.post(CONTACT_API, data);
  return res.data;
}
