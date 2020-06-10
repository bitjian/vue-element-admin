import { asyncRoutes, constantRoutes } from '@/router'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  // 如果该路由没有设置meta属性，则直接返回为true
  // 否则通过meta的 roles判断是否包含该 roles
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * 过滤对应角色的动态路由
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      // 将过滤的动态路由返回
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    // 将动态路由放入状态 addRoutes
    state.addRoutes = routes
    // 将动态路由push进 静态路由合成所有可访问的卤藕
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      let accessedRoutes
      // 如果权限包含 admin 则 获取所有动态路由
      if (roles.includes('admin')) {
        accessedRoutes = asyncRoutes || []
      } else {
        // 否则过滤 获取对应角色的路由
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      }
      // 设置路由
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
