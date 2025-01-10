import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore';
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthImagePattern from '../components/AuthImagePattern';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();

    login(formData);
  };

  const formOptions = [
    {
      label: "Email",
      name: "email",
      type: 'email',
      icon: Mail,
      placeholder: "alex@gmail.com"
    },
    {
      label: "Password",
      name: "password",
      type: 'password',
      icon: Lock,
      placeholder: "afex56@sr#"
    }
  ];

  return (
    <div className='min-h-screen grid lg:grid-cols-2'>
      {/* Left Side */}
      <div className='flex flex-col items-center justify-center p-6 sm:p-12'>
        <div className='w-full max-w-md space-y-8'>
          {/* Logo */}
          <div className='text-center mb-8'>
            <div className='flex flex-col items-center gap-2 group'>
              <div className='size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors'>
                <MessageSquare className='text-white w-full' />
              </div>
              <h1 className='text-2xl font-bold mt-2'>Welcome Back</h1>
              <p className='text-base-content/60'>Sign in to your account</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}
            className='space-y-6'>
            {
              formOptions.map((option, index) =>
                <div key={index} className='form-control'>
                  <label className='label'>
                    <span className='label-text font-medium'>{option.label}</span>
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <option.icon className='text-base-content/40 size-5' />
                    </div>
                    {
                      option.type === 'password' ?
                        <>
                        <input
                          type={showPassword ? 'text' : option.type}
                          className={`input input-bordered w-full pl-10`}
                          placeholder={option.placeholder}
                          value={formData[option.name]}
                          onChange={(e) => setFormData({ ...formData, [option.name]: e.target.value })}
                        />
                        <button
                          type="button"
                          className='absolute inset-y-0 right-0 pr-3 flex items-center'
                          onClick={()=> setShowPassword(!showPassword)}
                        >
                          {
                            showPassword ?
                              <EyeOff className='size-5 text-base-content/40'/>
                            :
                            <Eye className='size-5 text-base-content/40'/>
                          }
                        </button>
                        </>
                        :
                        <input
                          type={option.type}
                          className={`input input-bordered w-full pl-10`}
                          placeholder={option.placeholder}
                          value={formData[option.name]}
                          onChange={(e) => setFormData({ ...formData, [option.name]: e.target.value })}
                        />
                    }
                  </div>
                </div>
              )
            }

            <button type='submit' disabled={isLoggingIn} className='btn btn-primary w-full'>
              {
                isLoggingIn ?
                <>
                  <Loader2 className='size-5 animate-spin'/>
                  Loading...
                </>
                :
                "Login"
              }
            </button>
          </form>

          <div className='text-center'>
            <p className='text-base-content/60'>
              Don't have an account?{" "}
              <Link to="/signup" className='link link-primary'>
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <AuthImagePattern
      title="Join our community"
      subtitle="Connect with friends, share moments, and stay in touch wit your family" />
    </div>
  )
}

export default LoginPage