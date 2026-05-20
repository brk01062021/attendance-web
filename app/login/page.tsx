import LoginCard from '@/components/auth/LoginCard';
import ShellStyles from '@/components/layout/ShellStyles';

export default function LoginPage() {
  return (
    <main className="login-page page-dark">
      <ShellStyles />
      <LoginCard />
    </main>
  );
}
