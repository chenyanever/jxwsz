// docs for router https://github.com/thepassle/app-tools/blob/master/router/README.md

import { html } from 'lit';

if (!(globalThis as any).URLPattern) {
  await import("urlpattern-polyfill");
}

import { Router } from '@thepassle/app-tools/router.js';
import { lazy } from '@thepassle/app-tools/router/plugins/lazy.js';

// @ts-ignore
import { title } from '@thepassle/app-tools/router/plugins/title.js';

import './pages/app-home.js';

const baseURL: string = (import.meta as any).env.BASE_URL;

export const router = new Router({
    routes: [
      {
        path: resolveRouterPath(),
        title: '首页',
        render: () => html`<app-home></app-home>`
      },
      {
        path: resolveRouterPath('home'),
        title: '首页',
        render: () => html`<app-home></app-home>`
      },
      {
        path: resolveRouterPath('register'),
        title: '注册',
        plugins: [
          lazy(() => import('./pages/app-register.js')),
        ],
        render: () => html`<app-register></app-register>`
      },
      {
        path: resolveRouterPath('login'),
        title: '登录',
        plugins: [
          lazy(() => import('./pages/app-login.js')),
        ],
        render: () => html`<app-login></app-login>`
      },
      {
        path: resolveRouterPath('profile'),
        title: '我的',
        plugins: [
          lazy(() => import('./pages/app-profile/app-profile.js')),
        ],
        render: () => html`<app-profile></app-profile>`
      },
      {
        path: resolveRouterPath('paper-device-args/edit'),
        title: '纸机运行参数',
        plugins: [
          lazy(() => import('./pages/app-paper-device-args/edit.js')),
        ],
        render: () => html`<app-paper-device-args-edit></app-paper-device-args-edit>`
      },
      {
        path: resolveRouterPath('paper-device-args/edit/:id'),
        title: '纸机运行参数',
        plugins: [
          lazy(() => import('./pages/app-paper-device-args/edit.js')),
        ],
        render: () => html`<app-paper-device-args-edit></app-paper-device-args-edit>`
      },
      {
        path: resolveRouterPath('paper-device-args/index'),
        title: '纸机运行参数',
        plugins: [
          lazy(() => import('./pages/app-paper-device-args/index.js')),
        ],
        render: () => html`<app-paper-device-args-index></app-paper-device-args-index>`
      },
      {
        path: resolveRouterPath('about'),
        title: '关于',
        plugins: [
          lazy(() => import('./pages/app-about/app-about.js')),
        ],
        render: () => html`<app-about></app-about>`
      }



    ]
  });

  // This function will resolve a path with whatever Base URL was passed to the vite build process.
  // Use of this function throughout the starter is not required, but highly recommended, especially if you plan to use GitHub Pages to deploy.
  // If no arg is passed to this function, it will return the base URL.

  export function resolveRouterPath(unresolvedPath?: string) {
    var resolvedPath = baseURL;
    if(unresolvedPath) {
      resolvedPath = resolvedPath + unresolvedPath;
    }

    return resolvedPath;
  }
