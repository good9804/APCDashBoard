import { createWebHistory, createRouter } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("@/components/DashBoard"),
      meta: { requiresAdmin: true },
    },
    {
      path: "/dashboard/storage",
      name: "storage",
      component: () => import("@/components/Storage/StoragePage"),
      meta: { requiresAdmin: true },
    },
    {
      path: "/dashboard/view/storage",
      name: "StorageView",
      component: () => import("@/components/StorageViewPage"),
      meta: { requiresAdmin: true },
    },
  ],
});

import store from "./store/index";

router.beforeEach(async function (to, _, next) {
  await store.dispatch("refresh");
  await store.dispatch("getAlert");
  if (to.meta.requiresAuth) {
    await store.dispatch("verify");
    const access_message = await store.getters.getAccessMode;
    console.log(access_message);
    if (access_message == 0) {
      alert("로그인 후 이용해주세요.");
      next("/users/login");
    } else {
      next();
    }
  }
  if (to.meta.requiresAdmin) {
    const role = await store.getters.getUserRole;
    console.log(role);
    if (role == 0) {
      next();
    } else {
      alert("허용되지 않은 접근");
      next("/users");
    }
  }
  if (to.meta.requiresRole) {
    const role = await store.getters.getUserRole;
    console.log(role);
    if (role == 0) {
      next("/users/adminpage");
    } else if (role == 1) {
      next("/users/usermypage");
    } else {
      alert("로그인 후 이용해주세요.");
      next("/users/login");
    }
  } else {
    next();
  }
});

export default router;
