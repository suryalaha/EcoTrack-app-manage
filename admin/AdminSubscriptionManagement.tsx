import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Save, CheckCircle, IndianRupee, Users } from 'lucide-react';

const AdminSubscriptionManagement: React.FC = () => {
    const { subscriptionPlans, updateSubscriptionPlans } = useData();
    const [plans, setPlans] = useState(subscriptionPlans);
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        updateSubscriptionPlans({
            standard: Number(plans.standard),
            largeFamily: Number(plans.largeFamily),
            largeFamilyThreshold: Number(plans.largeFamilyThreshold),
        });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };
    
    const hasChanges = JSON.stringify(plans) !== JSON.stringify(subscriptionPlans);

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold text-heading-light dark:text-heading-dark mb-6">Subscription Model Management</h1>
            <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md max-w-2xl mx-auto">
                <h2 className="text-xl font-bold text-heading-light dark:text-heading-dark mb-2">Configure Subscription Pricing</h2>
                <p className="text-text-light dark:text-text-dark mb-6">
                    Set the monthly subscription rates based on the number of family members. The new rates will apply to new users upon signup.
                </p>

                <div className="space-y-6">
                    <div>
                        <label htmlFor="large-family-threshold" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
                            Large Family Threshold
                        </label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                id="large-family-threshold"
                                type="number"
                                value={plans.largeFamilyThreshold}
                                onChange={(e) => setPlans(prev => ({ ...prev, largeFamilyThreshold: e.target.value }))}
                                className="w-full p-3 pl-10 border border-border-light dark:border-border-dark bg-background-light dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">A family with more members than this number is considered a "large family".</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="standard-rate" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
                                Standard Rate (≤ {plans.largeFamilyThreshold} members)
                            </label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    id="standard-rate"
                                    type="number"
                                    value={plans.standard}
                                    onChange={(e) => setPlans(prev => ({ ...prev, standard: e.target.value }))}
                                    className="w-full p-3 pl-10 border border-border-light dark:border-border-dark bg-background-light dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                        <div>
                             <label htmlFor="large-family-rate" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
                                Large Family Rate (&gt; {plans.largeFamilyThreshold} members)
                            </label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    id="large-family-rate"
                                    type="number"
                                    value={plans.largeFamily}
                                    onChange={(e) => setPlans(prev => ({ ...prev, largeFamily: e.target.value }))}
                                    className="w-full p-3 pl-10 border border-border-light dark:border-border-dark bg-background-light dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end items-center space-x-4 pt-4 border-t border-border-light dark:border-border-dark">
                        {isSaved && (
                            <div className="flex items-center text-green-600 dark:text-green-400 animate-fade-in" role="status">
                                <CheckCircle size={18} className="mr-2" />
                                <span className="text-sm font-semibold">Plans Updated!</span>
                            </div>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={!hasChanges}
                            className="bg-gradient-to-r from-primary to-accent text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center shadow-lg hover:shadow-glow-primary transition-all transform hover:scale-105 disabled:from-slate-400 disabled:to-slate-500 disabled:shadow-none disabled:scale-100 disabled:cursor-not-allowed"
                        >
                            <Save size={18} className="mr-2" /> Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSubscriptionManagement;