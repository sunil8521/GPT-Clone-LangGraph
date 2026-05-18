import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/useAuthStore';

export function Auth() {
  const navigate = useNavigate();
  const { loginOrSignup } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await loginOrSignup(email, password);
    setLoading(false);
    
    if (success) {
      navigate('/chat');
    } else {
      alert("Authentication failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sign In / Sign Up
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Enter your details. We'll create an account if you don't have one!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />

          <Button type="submit" fullWidth className="mt-6" disabled={loading}>
            {loading ? 'Processing...' : 'Continue'}
          </Button>
        </form>

      </div>
    </div>
  );
}
