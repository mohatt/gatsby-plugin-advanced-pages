import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import compileRoute from '../../lib/route-compiler'
import { getOption } from '../util'

export default class PagesCreator {

	page
	pages
	routeMap
	createPageAction

	constructor({ routes, pages }){
		this.routeMap = this.buildRouteMap(routes)
		this.pages = pages.map(this.preparePage)
	}

 	// Adds basePath prefix to all route paths
  // Detects any duplicates
	buildRouteMap(routes){
		const routeMap = {}
	  for (const route of routes) {
	    const { name } = route
	    const exists = routeMap[name]
	    if(exists) {
	      throw new Error(
	        `'${route.page.path}' is trying to define a route named '${name}'` +
	        ` that is already defined in '${exists.page.path}'`
	      )
	    }
	    route.path = path.join(getOption('basePath'), route.path)
	    route.scopes = {}
	    route.pathGenerator = compileRoute(route.path)
	    routeMap[name] = route
	  }

	  return routeMap
	}

	preparePage(page){
		// Set file paths
    page.templatePath = path.join(
      getOption('directories.templates'),
      `${page.template}.js`
    )
    page.helperPath = page.helper && path.join(
      getOption('directories.helpers'),
      `${page.helper}.js`
    )

    // Validate file paths
    if (!fs.existsSync(page.templatePath)) {
      throw new Error(
      	`Invalid template '${page.template}' defined in page '${page.path}':` +
      	`  File does not exist at '${page.templatePath}'`
      )
    }

    if (page.helperPath && !fs.existsSync(page.helperPath)) {
      throw new Error(
      	`Invalid helper '${page.helper}' defined in page '${page.path}':` +
      	`  File does not exist at '${page.helperPath}'`
      )
    }

		// Prevent page helpers from mutating page object
	  return Object.freeze(page)
	}

  // Auto generates a new route based scope and parent route
  generateRoute(parent, scope) {
    let scopedPath
    switch(scope) {
      case 'pagination':
        scopedPath = path.join(
        	this.routeMap[parent].path,
        	getOption('pagination.suffix')
        )
        break
      default:
          throw new TypeError(
            `Unrecognized route scope '${scope}' passed to generateRoute()`
          )
    }
    return {
      name: parent + '.' + scope,
      path: scopedPath,
      page: {
        path: this.page.path
      },
      pathGenerator: compileRoute(scopedPath)
    }
  }

	async createPages({ graphql, createPage }) {
		this.createPageAction = createPage
		for(const page of this.pages){
			this.page = page
			// No page helper? Add static pages for all defined routes
			if(!page.helper){
    		page.routes.map(route => this.createPage({ route: route.name }))
				continue
			}
			// Run the page helper
	    try {
	    	let helperFunction = require(page.helperPath)
	    	if(typeof helperFunction.default === 'function') {
	    		helperFunction = helperFunction.default
	    	}

	      await helperFunction({
	      	graphql,
	      	page,
	      	createAdvancedPage: args => this.createPage(args)
	      })
	    } catch(e) {
	      const error = new Error(
	        `Error occured while running page helper function at '${page.helperPath}':` +
	        `\n${e.message}`
	      )
	      error.stack = e.stack
	      throw error
	    }
		}
	}

	createPage({ route, params = {}, filter, pagination }) {
		const { page } = this
    if(typeof route !== 'string' || !route) {
      throw new TypeError(
        `Route name passed to createAdvancedPage() at '${page.helperPath}'` +
        ` must be a non-empty string`
      )
    }

    const routeNode = this.routeMap[route]
    if(!routeNode) {
      throw new TypeError(
        `Unrecognized route '${route}' passed to createAdvancedPage() at '${page.helperPath}'`
      )
    }

    const gatsbyPage = {
      path: routeNode.pathGenerator(params),
      component: page.templatePath,
      context: {
        id: page.id,
        ...params
      }
    }
    
    if(filter) {
    	gatsbyPage.context.filter = filter
    }

    if(pagination){
      if(typeof pagination.count === 'undefined'){
        throw new TypeError(
          `Invalid pagination object passed to createAdvancedPage() at '${page.helperPath}': ` +
          `'count' paramater is missing`
        )
      }
      pagination.count = parseInt(pagination.count)
      if (!Number.isInteger(pagination.count)){
        throw new TypeError(
          `Invalid pagination object passed to createAdvancedPage() at '${page.helperPath}': ` +
          `'count' paramater must be a valid number (got '${pagination.count}')`
        )
      }

      pagination.limit = typeof pagination.limit !== 'undefined' && parseInt(pagination.limit)
      if(pagination.limit === false){
        pagination.limit = getOption('pagination.limit')
      }
      else if (pagination.limit <= 0 || !Number.isInteger(pagination.limit)){
        throw new TypeError(
          `Invalid pagination object passed to createAdvancedPage() at '${page.helperPath}': ` +
          `'limit' paramater must be a valid number (got '${pagination.limit}')`
        )
      }

      if(!routeNode.scopes.pagination) {
        if(typeof pagination.route === 'undefined') {
          // Auto generate a paginated route for main route
          routeNode.scopes.pagination = this.generateRoute(route, 'pagination')
        } else {
          if(!this.routeMap[pagination.route]) {
            throw new TypeError(
              `Invalid pagination object passed to createAdvancedPage() at '${page.helperPath}': ` +
              `Unrecognized route '${pagination.route}'`
            )
          }
          routeNode.scopes.pagination = this.routeMap[pagination.route]
        }
      }

      const generatePagePath = n => routeNode.scopes.pagination.pathGenerator(
        { page: n, ...params }
      )
      const pagesCount = Math.ceil(pagination.count / pagination.limit)
      for (let i = 1; i <= pagesCount; i++) {
        const gatsbyPaginatedPage = {
          path: i === 1 ? gatsbyPage.path : generatePagePath(i),
          component: gatsbyPage.component,
          context: {
            ...gatsbyPage.context,
            limit: pagination.limit,
            offset: (i-1) * pagination.limit,
          }
        }

        this.createPageAction(gatsbyPaginatedPage)
      }

      return
    }

    this.createPageAction(gatsbyPage)
  }
  
  writeRouteMap(filename) {
    const map = _.mapValues(this.routeMap, route => ({
      path: route.path,
      scopes: _.mapValues(route.scopes, 'path') 
    }))
    const content = `"use strict";\n\nmodule.exports = ${JSON.stringify(map, null, 2)};`
    try {
    	fs.writeFileSync(filename, content)
    	return content
    } catch (e) {
    	throw new Error(`Error writing route map export file:\n${e.message}`)
    }
  }
}
