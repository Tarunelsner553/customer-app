import { json } from "@remix-run/node";
import db from "../db.server";

export async function action() {
  try {
    let data = await db.session.findMany();
    console.log("Server Data: ", data);
    return json(data);
  }
  catch (error) {
    console.error("Error in fetch:", error);
    return json({ error: 'Failed to fetch data' }, { status: 500 });

  }
}
