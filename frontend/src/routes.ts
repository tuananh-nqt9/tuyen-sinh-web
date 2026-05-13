export default [
  {
    path: '/',
    component: '@/layouts/MainLayout',
    routes: [
      { path: '/', component: '@/pages/Home' },
      { path: '/login', component: '@/pages/Login' },
      { path: '/register', component: '@/pages/Register' },
      { path: '/schools', component: '@/pages/Schools' },
      { path: '/school/:id', component: '@/pages/SchoolDetail' },
      { path: '/majors', component: '@/pages/Majors' },
      { path: '/contact', component: '@/pages/Contact' },
      {
        path: '/candidate',
        component: '@/pages/candidate/Layout',
        routes: [
          { path: '/candidate', redirect: '/candidate/dashboard' },
          { path: '/candidate/dashboard', component: '@/pages/candidate/Dashboard' },
          { path: '/candidate/registration', component: '@/pages/candidate/Registration' },
          { path: '/candidate/applications', component: '@/pages/candidate/Applications' },
          { path: '/candidate/application/:id', component: '@/pages/candidate/ApplicationDetail' },
          { path: '/candidate/profile', component: '@/pages/candidate/Profile' },
        ]
      },
      {
        path: '/admin',
        component: '@/pages/admin/Layout',
        routes: [
          { path: '/admin', redirect: '/admin/dashboard' },
          { path: '/admin/dashboard', component: '@/pages/admin/Dashboard' },
          { path: '/admin/schools', component: '@/pages/admin/Schools' },
          { path: '/admin/majors', component: '@/pages/admin/Majors' },
          { path: '/admin/combinations', component: '@/pages/admin/Combinations' },
          { path: '/admin/applications', component: '@/pages/admin/Applications' },
          { path: '/admin/application/:id', component: '@/pages/admin/ApplicationDetail' },
          { path: '/admin/users', component: '@/pages/admin/Users' },
        ]
      },
    ]
  }
];
