import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from './pages/Home.page';
import { Datamenu } from './pages/Datamenu.page';
import { MyDatasetsPage } from './pages/MyDatasets.page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/my-datasets',
    element: <MyDatasetsPage />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
