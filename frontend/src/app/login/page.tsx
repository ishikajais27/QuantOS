// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { login, getUser } from '@/lib/auth'
// import { useUser } from '@/context/UserContext'

// export default function LoginPage() {
//   const router = useRouter()
//   const { refreshUser } = useUser()
//   const [identifier, setIdentifier] = useState('')
//   const [password, setPassword] = useState('')
//   const [showPass, setShowPass] = useState(false)
//   const [error, setError] = useState('')
//   const [loading, setLoading] = useState(false)

//   useEffect(() => {
//     if (getUser()) router.replace('/')
//   }, [router])

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError('')

//     if (!identifier.trim()) {
//       setError('Enter your email or username.')
//       return
//     }
//     if (!password) {
//       setError('Enter your password.')
//       return
//     }

//     setLoading(true)
//     try {
//       await login(identifier.trim(), password)
//       refreshUser()
//       router.push('/')
//     } catch (err: any) {
//       setError(
//         err.message ??
//           'Invalid credentials. Please check your email and password.',
//       )
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
//       <div className="mb-10 text-center">
//         <div className="text-green-400 font-bold text-3xl tracking-widest font-mono mb-2">
//           QuantOS
//         </div>
//         <p className="text-gray-500 text-xs">
//           Multi-Exchange Algorithmic Trading Platform
//         </p>
//       </div>

//       <div className="w-full max-w-md">
//         <div className="card border border-gray-800 p-8">
//           <h1 className="text-white font-bold text-lg mb-1">Sign in</h1>
//           <p className="text-gray-500 text-xs mb-6">
//             Enter your credentials to access the platform.
//           </p>

//           <form onSubmit={handleLogin} className="space-y-5">
//             <div>
//               <label className="text-gray-400 text-xs block mb-1">
//                 Email or Username
//               </label>
//               <input
//                 type="text"
//                 placeholder="you@example.com"
//                 value={identifier}
//                 onChange={(e) => setIdentifier(e.target.value)}
//                 autoComplete="username"
//                 className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
//               />
//             </div>

//             <div>
//               <label className="text-gray-400 text-xs block mb-1">
//                 Password
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPass ? 'text' : 'password'}
//                   placeholder="Your password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   autoComplete="current-password"
//                   className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 transition-colors pr-14"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPass((s) => !s)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs transition-colors"
//                 >
//                   {showPass ? 'Hide' : 'Show'}
//                 </button>
//               </div>
//             </div>

//             {error && (
//               <p className="text-red-400 text-xs bg-red-900/20 border border-red-800 rounded p-2">
//                 {error}
//               </p>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2.5 rounded text-sm font-bold transition-colors"
//             >
//               {loading ? 'Signing in…' : 'Enter Platform'}
//             </button>
//           </form>

//           {/* Demo credentials */}
//           <div className="mt-6 border border-gray-800 rounded p-3 space-y-1">
//             <div className="text-gray-600 text-xs uppercase tracking-wider mb-2">
//               Demo accounts (password: test123)
//             </div>
//             {[
//               {
//                 role: 'Retail',
//                 color: 'text-green-600',
//                 email: 'test@gmail.com',
//               },
//               {
//                 role: 'Quant',
//                 color: 'text-purple-500',
//                 email: 'quant@gmail.com',
//               },
//               {
//                 role: 'Institutional',
//                 color: 'text-yellow-500',
//                 email: 'inst@gmail.com',
//               },
//             ].map(({ role, color, email }) => (
//               <button
//                 key={email}
//                 type="button"
//                 onClick={() => {
//                   setIdentifier(email)
//                   setPassword('test123')
//                 }}
//                 className="w-full text-left flex items-center gap-3 hover:bg-gray-800 rounded px-2 py-1 transition-colors group"
//               >
//                 <span className={`${color} text-xs font-mono w-24`}>
//                   {role}
//                 </span>
//                 <span className="text-gray-500 text-xs font-mono group-hover:text-gray-300 transition-colors">
//                   {email}
//                 </span>
//               </button>
//             ))}
//           </div>

//           <p className="text-gray-600 text-xs mt-4 text-center">
//             First time?{' '}
//             <a href="/signup" className="text-green-400 hover:underline">
//               Create an account
//             </a>
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { login, getUser } from '@/lib/auth'
import { useUser } from '@/context/UserContext'

export default function LoginPage() {
  const router = useRouter()
  const { refreshUser } = useUser()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getUser()) router.replace('/')
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!identifier.trim()) {
      setError('Enter your email.')
      return
    }
    if (!password) {
      setError('Enter your password.')
      return
    }

    setLoading(true)
    try {
      await login(identifier.trim(), password)
      refreshUser()
      router.push('/')
    } catch (err: any) {
      setError(err.message ?? 'Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="mb-10 text-center">
        <div className="text-green-400 font-bold text-3xl tracking-widest font-mono mb-2">
          QuantOS
        </div>
        <p className="text-gray-500 text-xs">
          Multi-Exchange Algorithmic Trading Platform
        </p>
      </div>

      <div className="w-full max-w-md">
        <div className="card border border-gray-800 p-8">
          <h1 className="text-white font-bold text-lg mb-1">Sign in</h1>
          <p className="text-gray-500 text-xs mb-6">
            Enter your credentials to access the platform.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-gray-400 text-xs block mb-1">Email</label>
              <input
                type="text"
                placeholder="you@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-gray-400 text-xs block mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 transition-colors pr-14"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs"
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-900/20 border border-red-800 rounded p-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2.5 rounded text-sm font-bold transition-colors"
            >
              {loading ? 'Signing in…' : 'Enter Platform'}
            </button>
          </form>

          <div className="mt-6 border border-gray-800 rounded p-3 space-y-1">
            <div className="text-gray-600 text-xs uppercase tracking-wider mb-2">
              Demo accounts (password: test123)
            </div>
            {[
              {
                role: 'Retail',
                color: 'text-green-600',
                email: 'test@gmail.com',
              },
              {
                role: 'Quant',
                color: 'text-purple-500',
                email: 'quant@gmail.com',
              },
              {
                role: 'Institutional',
                color: 'text-yellow-500',
                email: 'inst@gmail.com',
              },
            ].map(({ role, color, email }) => (
              <button
                key={email}
                type="button"
                onClick={() => {
                  setIdentifier(email)
                  setPassword('test123')
                }}
                className="w-full text-left flex items-center gap-3 hover:bg-gray-800 rounded px-2 py-1 transition-colors group"
              >
                <span className={`${color} text-xs font-mono w-24`}>
                  {role}
                </span>
                <span className="text-gray-500 text-xs font-mono group-hover:text-gray-300 transition-colors">
                  {email}
                </span>
              </button>
            ))}
          </div>

          <p className="text-gray-600 text-xs mt-4 text-center">
            First time?{' '}
            <a href="/signup" className="text-green-400 hover:underline">
              Create an account
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
