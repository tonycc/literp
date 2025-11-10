#!/usr/bin/env node
/**
 * 循环依赖检查脚本
 * Circular Dependency Checker
 *
 * 扫描并检测代码中的循环依赖
 */

const fs = require('fs')
const path = require('path')

// 支持的文件扩展名
const SUPPORTED_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx']

// 忽略的目录
const IGNORE_DIRS = [
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.git',
  '.next',
  '.nuxt',
  'out',
]

// 存储模块依赖图
const dependencyGraph = new Map()

/**
 * 提取文件中的导入语句
 */
function extractImports(filePath, content) {
  const imports = []

  // 匹配 import 语句
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g
  let match

  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1]

    // 跳过绝对URL和没有相对路径的导入
    if (importPath.startsWith('http://') || importPath.startsWith('https://')) {
      continue
    }

    // 跳过包名导入 (以 ./ 或 ../ 开头的是相对/绝对路径)
    if (!importPath.startsWith('./') && !importPath.startsWith('../') && !importPath.startsWith('/')) {
      continue
    }

    imports.push(importPath)
  }

  // 匹配 require 语句
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  while ((match = requireRegex.exec(content)) !== null) {
    const importPath = match[1]

    if (importPath.startsWith('http://') || importPath.startsWith('https://')) {
      continue
    }

    if (!importPath.startsWith('./') && !importPath.startsWith('../') && !importPath.startsWith('/')) {
      continue
    }

    imports.push(importPath)
  }

  return imports
}

/**
 * 解析模块路径
 */
function resolveModulePath(fromPath, importPath, workspaceRoot) {
  // 规范化导入路径
  let resolvedPath = importPath

  // 移除文件扩展名
  if (resolvedPath.endsWith('.ts') || resolvedPath.endsWith('.tsx') ||
      resolvedPath.endsWith('.js') || resolvedPath.endsWith('.jsx')) {
    resolvedPath = resolvedPath.slice(0, -path.extname(resolvedPath).length)
  }

  // 处理 index 文件
  if (resolvedPath.endsWith('/index')) {
    resolvedPath = resolvedPath.replace('/index', '')
  }

  // 解析相对路径
  const fromDir = path.dirname(fromPath)
  const absolutePath = path.resolve(fromDir, resolvedPath)

  // 检查是否存在该文件
  for (const ext of SUPPORTED_EXTENSIONS) {
    const fileWithExt = absolutePath + ext
    if (fs.existsSync(fileWithExt)) {
      return fileWithExt
    }
  }

  // 检查是否存在 index 文件
  for (const ext of SUPPORTED_EXTENSIONS) {
    const indexFile = absolutePath + '/index' + ext
    if (fs.existsSync(indexFile)) {
      return indexFile
    }
  }

  return null
}

/**
 * 扫描目录中的所有文件
 */
function scanDirectory(dirPath, workspaceRoot) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)

    // 跳过忽略的目录
    if (IGNORE_DIRS.includes(entry.name)) {
      continue
    }

    if (entry.isDirectory()) {
      // 递归扫描子目录
      scanDirectory(fullPath, workspaceRoot)
    } else if (entry.isFile() && SUPPORTED_EXTENSIONS.includes(path.extname(entry.name))) {
      // 处理源代码文件
      try {
        const content = fs.readFileSync(fullPath, 'utf-8')
        const imports = extractImports(fullPath, content)
        const relativePath = path.relative(workspaceRoot, fullPath)

        const dependencies = []
        for (const importPath of imports) {
          const resolvedPath = resolveModulePath(fullPath, importPath, workspaceRoot)
          if (resolvedPath) {
            const depRelativePath = path.relative(workspaceRoot, resolvedPath)
            dependencies.push(depRelativePath)
          }
        }

        dependencyGraph.set(relativePath, dependencies)
      } catch (error) {
        console.error(`Error reading file ${fullPath}:`, error.message)
      }
    }
  }
}

/**
 * 检测循环依赖
 */
function findCycles() {
  const cycles = []
  const visited = new Set()
  const recursionStack = new Set()

  function dfs(node, path) {
    if (recursionStack.has(node)) {
      // 找到循环
      const cycleStart = path.indexOf(node)
      const cycle = path.slice(cycleStart).concat(node)
      cycles.push(cycle)
      return
    }

    if (visited.has(node)) {
      return
    }

    visited.add(node)
    recursionStack.add(node)
    path.push(node)

    const dependencies = dependencyGraph.get(node) || []
    for (const dep of dependencies) {
      dfs(dep, [...path])
    }

    recursionStack.delete(node)
  }

  for (const node of dependencyGraph.keys()) {
    if (!visited.has(node)) {
      dfs(node, [])
    }
  }

  return cycles
}

/**
 * 主函数
 */
function main() {
  const workspaceRoot = process.cwd()
  const srcDirs = ['frontend/src', 'backend/src', 'shared/src', 'external-portal/src']

  console.log('开始扫描循环依赖...\n')

  // 扫描各个源码目录
  for (const srcDir of srcDirs) {
    const fullPath = path.join(workspaceRoot, srcDir)
    if (fs.existsSync(fullPath)) {
      console.log(`扫描 ${srcDir}...`)
      scanDirectory(fullPath, workspaceRoot)
    } else {
      console.log(`跳过 ${srcDir} (目录不存在)`)
    }
  }

  console.log('\n检测循环依赖...')

  const cycles = findCycles()

  if (cycles.length === 0) {
    console.log('\n✅ 未发现循环依赖！')
    process.exit(0)
  } else {
    console.log(`\n❌ 发现 ${cycles.length} 个循环依赖:\n`)

    cycles.forEach((cycle, index) => {
      console.log(`循环 ${index + 1}:`)
      cycle.forEach((node, i) => {
        const arrow = i === cycle.length - 1 ? '└─' : '├─'
        console.log(`  ${arrow} ${node}`)
      })
      console.log()
    })

    process.exit(1)
  }
}

// 运行主函数
main()
