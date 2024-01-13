import {
  Form,
  Route,
  createRoutesFromElements,
  useActionData,
  useLoaderData,
} from "react-router-dom";

const loader = async () => {
  return {
    data: "hello world",
  };
};

const action = async () => {
  return {
    data: Math.random(),
  };
};

export const routes = createRoutesFromElements(
  <Route index loader={loader} action={action} element={<App />} />,
);

function App() {
  const loaderData = useLoaderData() as any;
  const actionData = useActionData() as any;

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="./tailwind.css" rel="stylesheet" />
      </head>
      <body>
        <div>Data from loader: {loaderData.data}</div>
        {actionData != null && <div>Data from action: {actionData.data}</div>}
        <Form method="POST">
          <button type="submit">Click here!</button>
        </Form>
        <script type="module" src="/hydrate.js"></script>
        <script type="module" src="/ws.js"></script>
      </body>
    </html>
  );
}
