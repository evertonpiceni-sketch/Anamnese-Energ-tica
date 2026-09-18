import AdminApp from './AdminApp';
import UserAnamneseApp from './components/UserAnamneseApp';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const adminPreview = params.get('admin') === '1';

  if (adminPreview) {
    return <AdminApp />;
  }

  return <UserAnamneseApp />;
}
