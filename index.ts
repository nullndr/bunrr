import { setupServer } from "./setupServer";

const server = await setupServer();

console.log(`Listening on ${server.port}`);
