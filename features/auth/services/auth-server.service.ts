import { cookies } from 'next/headers';
import { authService } from './auth.service';

export class AuthServerUtils {
  static async getServerToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(
      process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'rethread_admin_token'
    );
    return tokenCookie?.value;
  }

  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getServerToken();
    if (!token) return false;

    try {
      return await authService.verifyToken(token);
    } catch {
      return false;
    }
  }
}
