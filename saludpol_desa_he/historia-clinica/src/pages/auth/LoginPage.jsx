import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { login } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.token, data)
      navigate('/', { replace: true })
    },
    onError: (error) => setError(error.response?.data?.message || 'Usuario o contraseña incorrectos'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!form.username || !form.password) {
      setError('Complete todos los campos')
      return
    }
    mutate(form)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <img src="/logo.png" alt="SALUDPOL" className={styles.logo} />
          <h1 className={styles.title}>SALUDPOL</h1>
          <p className={styles.subtitle}>Historia Clínica Electrónica</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="username" className={styles.label}>Usuario</label>
            <Input
              id="username"
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              placeholder="Ingrese su usuario"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Contraseña</label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="Ingrese su contraseña"
              autoComplete="current-password"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}
    
          <Button type="submit" variant="primary" size="lg" disabled={isPending}>
            {isPending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>
      </div>
    </div>
  )
}