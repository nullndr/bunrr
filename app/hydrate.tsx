import { hydrateRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routes } from "./root";

const router = createBrowserRouter(routes);
hydrateRoot(document, <RouterProvider router={router} />);
