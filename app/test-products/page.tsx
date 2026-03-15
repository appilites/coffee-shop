"use client"

import { useEffect, useState } from "react"
import { menuItemService, categoryService } from "@/lib/supabase/database"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export default function TestProductsPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    runTests()
  }, [])

  const runTests = async () => {
    const results: any = {
      timestamp: new Date().toISOString(),
      supabaseClient: null,
      directQuery: null,
      serviceQuery: null,
      categories: null,
    }

    try {
      // Test 1: Check Supabase client
      const supabase = getSupabaseBrowserClient()
      results.supabaseClient = {
        status: supabase ? 'available' : 'not available',
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'not set'
      }

      // Test 2: Direct Supabase query
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .limit(10)

        results.directQuery = {
          success: !error,
          error: error ? {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          } : null,
          count: data?.length || 0,
          sample: data?.[0] || null
        }
      } catch (err: any) {
        results.directQuery = {
          success: false,
          error: {
            message: err.message,
            stack: err.stack
          }
        }
      }

      // Test 3: Service query
      try {
        const products = await menuItemService.getAll()
        results.serviceQuery = {
          success: true,
          count: products.length,
          sample: products[0] || null
        }
      } catch (err: any) {
        results.serviceQuery = {
          success: false,
          error: {
            message: err.message,
            stack: err.stack
          }
        }
      }

      // Test 4: Categories
      try {
        const categories = await categoryService.getAll()
        results.categories = {
          success: true,
          count: categories.length,
          sample: categories[0] || null
        }
      } catch (err: any) {
        results.categories = {
          success: false,
          error: {
            message: err.message
          }
        }
      }

    } catch (err: any) {
      results.error = {
        message: err.message,
        stack: err.stack
      }
    }

    setTestResults(results)
    setLoading(false)
  }

  if (loading) {
    return <div className="p-8">Running tests...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Product Fetch Test Results</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
        {JSON.stringify(testResults, null, 2)}
      </pre>
      <button 
        onClick={runTests}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Run Tests Again
      </button>
    </div>
  )
}
