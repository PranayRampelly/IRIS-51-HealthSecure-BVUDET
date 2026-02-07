import React, { useState } from 'react';
import { Stethoscope, Home, Activity, BarChart3, Info } from 'lucide-react';
import healthCoachService from '@/services/healthCoachService';
import DiseasePrediction from './DiseasePrediction';

const navItems = [
  { label: 'Home', icon: <Home className="w-5 h-5 mr-2" /> },
  { label: 'Disease Prediction', icon: <Activity className="w-5 h-5 mr-2" /> },
  { label: 'Health Advisory', icon: <Stethoscope className="w-5 h-5 mr-2" /> },
  { label: 'Visualizations', icon: <BarChart3 className="w-5 h-5 mr-2" /> },
  { label: 'About', icon: <Info className="w-5 h-5 mr-2" /> },
];

const HealthCoach: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePage, setActivePage] = useState('Disease Prediction');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Split input by comma, trim whitespace, and filter out empty strings
      const symptomsList = input.split(',').map(s => s.trim()).filter(Boolean);
      const data = await healthCoachService.getHealthCoachPrediction({ symptoms: symptomsList });
      setResult(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Something went wrong');
      } else {
        setError('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-open-sans">
      {/* HealthSecure sidebar remains as-is */}
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start py-8 px-4">
        {/* Full-width navbar outside the centered content */}
        <nav className="w-full flex items-center justify-between bg-[#f7f8fa] px-0 py-2 mb-2 shadow-sm border border-gray-200">
          <div className="flex items-center ml-6">
            <Stethoscope className="w-6 h-6 text-health-teal mr-2" />
            <span className="text-lg font-bold text-health-teal">Health Advisor AI</span>
          </div>
          <ul className="flex gap-1 ml-6 mr-6">
            {navItems.map((item) => (
              <li key={item.label}>
                <button
                  className={`flex items-center px-3 py-1.5 rounded text-base font-medium transition-colors ${
                    activePage === item.label
                      ? 'bg-red-500 text-white font-bold shadow'
                      : 'text-health-charcoal hover:bg-health-aqua/10'
                  }`}
                  onClick={() => setActivePage(item.label)}
                  disabled={activePage === item.label}
                >
                  {React.cloneElement(item.icon, { className: 'w-4 h-4 mr-1' })}
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        {/* Centered content below navbar */}
        <div className="w-full max-w-4xl">
          {activePage === 'Disease Prediction' ? (
            <DiseasePrediction />
          ) : (
            <>
              <div className="flex items-center mb-6">
                <Stethoscope className="w-8 h-8 text-health-teal mr-3" />
                <h1 className="text-2xl font-bold text-health-teal">My Health Coach</h1>
              </div>
              <div className="bg-health-light-gray rounded-lg shadow p-6">
                <form onSubmit={handleSubmit} className="mb-4">
                  <label className="block mb-2 text-health-charcoal font-semibold">Describe your symptoms:</label>
                  <input
                    type="text"
                    className="w-full p-2 rounded border border-health-teal focus:outline-none focus:ring-2 focus:ring-health-aqua"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="e.g. headache, fever, cough"
                    required
                  />
                  <button
                    type="submit"
                    className="mt-4 px-6 py-2 bg-health-teal text-white rounded hover:bg-health-aqua transition"
                    disabled={loading}
                  >
                    {loading ? 'Analyzing...' : 'Get Advice'}
                  </button>
                </form>
                {error && <div className="text-red-500 mb-2">{error}</div>}
                {result && (
                  <div className="mt-4 p-4 bg-white rounded shadow">
                    <h2 className="text-lg font-bold text-health-teal mb-2">Health Coach Result</h2>
                    <pre className="whitespace-pre-wrap text-health-charcoal">{typeof result === 'string' ? result : JSON.stringify(result, null, 2)}</pre>
                  </div>
                )}
                {!result && !loading && !error && (
                  <p className="text-health-charcoal text-lg">
                    Welcome to your personal Health Coach! Enter your symptoms above to get personalized health tips, recommendations, and more.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default HealthCoach; 