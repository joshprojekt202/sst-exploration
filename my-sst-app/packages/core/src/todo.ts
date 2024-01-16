// export * as Todo from "./todo";
// import { z } from "zod";
// import crypto from "crypto";

// import { event } from "./event";

// export const Events = {
//   Created: event("todo.created", {
//     id: z.string(),
//   }),
// };

// export async function create() {
//   const id = crypto.randomUUID();
//   // write to database

//   await Events.Created.publish({
//     id,
//   });
// }

// export function list() {
//   return Array(50)
//     .fill(0)
//     .map((_, index) => ({
//       id: crypto.randomUUID(),
//       title: "Todo #" + index,
//     }));
// }

import { DynamoDB } from 'aws-sdk';
import { z } from "zod";
import crypto from "crypto";
import { createEventBuilder, ZodValidator } from "sst/node/event-bus";

const dynamoDb = new DynamoDB.DocumentClient();
const tableName = process.env.MY_TABLE_NAME;  // Ensure this environment variable is set in your Lambda functions

export const event = createEventBuilder({
  bus: "bus",
  validator: ZodValidator,
});

export const Events = {
  Created: event("todo.created", {
    id: z.string(),
  }),
};

export async function create() {
  const id = crypto.randomUUID();
  const item = {
    id: id,
    // Add other to-do item properties as needed
  };

  const params = {
    TableName: tableName,
    Item: item,
  };

  await dynamoDb.put(params).promise();
  await Events.Created.publish({ id });

  return item;
}

export async function list() {
  const params = {
    TableName: tableName,
  };

  const result = await dynamoDb.scan(params).promise();
  return result.Items;
}
