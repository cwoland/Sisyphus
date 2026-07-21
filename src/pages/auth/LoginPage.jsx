import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

import { AuthLayout } from './AuthLayout.jsx';
import { Input } from '../../shared/ui/Input.jsx';
import { PasswordInput } from '../../shared/ui/PasswordInput.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { loginRequest } from '../../entities/user/auth.api.js';
import { useAuthStore } from '../../entities/user/auth.store.js';

const loginSchema = z.object({
  email: z.string().min(1, 'Введите email').email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [shake, setShake] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      login(data.user, data.accessToken);
      navigate('/', { replace: true });
    },
    onError: () => {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    },
  });

  const onSubmit = (data) => mutation.mutate(data);

  const serverError = mutation.isError
    ? mutation.error?.response?.data?.message || 'Не удалось войти'
    : null;

  return (
    <AuthLayout
      title="С возвращением"
      subtitle="Войдите, чтобы продолжить восхождение"
      footer={
        <>
          Нет аккаунта?{' '}
          <Link to="/register" className="font-medium text-accent hover:text-accent-hover">
            Зарегистрироваться
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={clsx('space-y-4', shake && 'animate-shake')}
        noValidate
      >
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <PasswordInput
          id="password"
          label="Пароль"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        {serverError && (
          <p className="text-sm font-medium text-crimson text-center">{serverError}</p>
        )}

        <Button type="submit" isLoading={mutation.isPending} className="w-full" size="lg">
          Войти
        </Button>
      </form>
    </AuthLayout>
  );
};