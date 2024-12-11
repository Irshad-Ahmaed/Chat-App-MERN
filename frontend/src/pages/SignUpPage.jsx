import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthImagePattern from '../components/AuthImagePattern';
import toast from 'react-hot-toast';

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: ""
  });

  const { signup, isSigningUp } = useAuthStore();
  
  const validateForm = () => {
    console.log("enter validation")
    if(!formData.fullName.trim()) return toast.error("Full name is required");
    if(!formData.email.trim()) return toast.error("Email is required");
    if(!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid Email format");
    if(!formData.password) return toast.error("Password is required");
    if(formData.password.length<6) return toast.error("Password must be at least 6 character");

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const success = validateForm();

    if(success === true) signup(formData);
  };

  const formOptions = [
    {
      label: "Full Name",
      name: "fullName",
      type: 'text',
      icon: User,
      placeholder: "Jon Doe"
    },
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
    <div className='min-h-screen grid grid-cols-2'>
      {/* Left Side */}
      <div className='flex flex-col items-center justify-center p-6 sm:p-12'>
        <div className='w-full max-w-md space-y-8'>
          {/* Logo */}
          <div className='text-center mb-8'>
            <div className='flex flex-col items-center gap-2 group'>
              <div className='size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors'>
                <MessageSquare className='text-white w-full' />
              </div>
              <h1 className='text-2xl font-bold mt-2'>Create Account</h1>
              <p className='text-base-content/60'>Get started with your free account</p>
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

            <button type='submit' disabled={isSigningUp} className='btn btn-primary w-full'>
              {
                isSigningUp ?
                <>
                  <Loader2 className='size-5 animate-spin'/>
                  Loading...
                </>
                :
                "Create Account"
              }
            </button>
          </form>

          <div className='text-center'>
            <p className='text-base-content/60'>
              Already have an account?{" "}
              <Link to="/login" className='link link-primary'>
                Log in
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
  );
};

export default SignUpPage;