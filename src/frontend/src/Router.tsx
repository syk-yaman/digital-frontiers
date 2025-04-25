import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from './pages/Home.page';
import { Datamenu } from './pages/Datamenu.page';
import { MyDatasetsPage } from './pages/MyDatasets.page';
import { AddDatasetPage } from './pages/AddDataset.page';
import { TagDatasets } from './pages/TagDatasets.page';

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
  {
    path: '/data-menu/tag/:tagId',
    element: <TagDatasets />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
