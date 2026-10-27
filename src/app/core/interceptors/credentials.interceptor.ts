import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@env/environment';

/**
 * La sesión vive en una cookie httpOnly puesta por el backend
 * (`/auth/cookie/login`); el navegador no la expone a JS, así que en vez de
 * adjuntar un header Authorization solo hace falta pedirle a cada request
 * hacia nuestra API que envíe/reciba cookies entre orígenes.
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith(environment.apiUrl)) {
    return next(req.clone({ withCredentials: true }));
  }

  return next(req);
};
