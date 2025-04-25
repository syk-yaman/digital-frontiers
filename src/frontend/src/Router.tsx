import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from './pages/Home.page';
import { Datamenu } from './pages/Datamenu.page';
import { MyDatasetsPage } from './pages/MyDatasets.page';
import { AddDatasetPage } from './pages/AddDataset.page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/my-datasets',
    element: <MyDatasetsPage />,
  },
  {
    path: '/add-dataset',
    element: <AddDatasetPage />,
  },
  {
    path: '/edit-dataset/:id',
    element: <AddDatasetPage />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
