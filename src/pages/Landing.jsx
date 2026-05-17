// export default function Landing() { return <div className="p-8 text-2xl font-light">Landing</div> }

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Landing() {
  const [status, setStatus] = useState('checking...')

  useEffect(() => {
    supabase.from('profiles').select('count').then(({ error }) => {
      setStatus(error ? 'connection failed: ' + error.message : 'Supabase connected!')
    })
  }, [])

  return (
    <div className="p-8 text-2xl font-light">
      {status}
    </div>
  )
}