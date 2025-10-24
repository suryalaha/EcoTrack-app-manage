import React, { useState } from 'react';
import type { Complaint } from '../types';
import { PlusCircle, Paperclip, Pencil } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ComplaintsComponentProps {
  complaints: Complaint[];
  addComplaint: (complaint: Complaint) => void;
  updateComplaint: (complaint: Complaint) => void;
}

const ComplaintsComponent: React.FC<ComplaintsComponentProps> = ({ complaints, addComplaint, updateComplaint }) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingComplaintId, setEditingComplaintId] = useState<string | null>(null);
  const [issue, setIssue] = useState('');
  const [details, setDetails] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined);

  const clearAndCloseForm = () => {
    setEditingComplaintId(null);
    setIssue('');
    setDetails('');
    setPhoto(null);
    setPhotoPreview(undefined);
    setShowForm(false);
  };

  const handleEditClick = (complaint: Complaint) => {
    setEditingComplaintId(complaint.id);
    setIssue(complaint.issue);
    setDetails(complaint.details);
    setPhoto(null);
    setPhotoPreview(complaint.photo);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleToggleNewForm = () => {
      // Always clear previous state when toggling form
      if (!showForm) { 
        setEditingComplaintId(null);
        setIssue('');
        setDetails('');
        setPhoto(null);
        setPhotoPreview(undefined);
      }
      setShowForm(!showForm);
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhoto(file);
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      const originalComplaint = complaints.find(c => c.id === editingComplaintId);
      setPhotoPreview(originalComplaint?.photo);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue || !details || !user) return;

    if (editingComplaintId) {
      const originalComplaint = complaints.find(c => c.id === editingComplaintId);
      if (!originalComplaint) return;

      const updatedComplaint: Complaint = {
        ...originalComplaint,
        issue,
        details,
        photo: photoPreview,
      };
      updateComplaint(updatedComplaint);
    } else {
      const newComplaint: Complaint = {
        id: `CMPT-${Date.now()}`,
        householdId: user.householdId,
        date: new Date(),
        issue,
        details,
        status: 'Pending',
        photo: photo ? URL.createObjectURL(photo) : undefined,
      };
      addComplaint(newComplaint);
    }
    clearAndCloseForm();
  };
  
  const getStatusColor = (status: Complaint['status']) => {
    switch (status) {
        case 'Pending': return 'bg-warning/10 text-warning-dark dark:bg-warning/20 dark:text-warning';
        case 'In Progress': return 'bg-info/10 text-info-dark dark:bg-info/20 dark:text-info';
        case 'Resolved': return 'bg-success/10 text-success-dark dark:bg-success/20 dark:text-success';
    }
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-heading-light dark:text-heading-dark">Complaints & Feedback</h2>
        <button onClick={handleToggleNewForm} className="bg-gradient-to-r from-primary to-accent text-white p-2 rounded-full shadow-md hover:shadow-glow-primary transition-transform transform hover:scale-110">
          <PlusCircle size={24} />
        </button>
      </div>

      {showForm && (
        <div className="bg-card-light dark:bg-card-dark p-4 rounded-lg shadow-md mb-6 border border-border-light dark:border-border-dark animate-fade-in-down">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold text-heading-light dark:text-heading-dark">{editingComplaintId ? 'Edit Complaint' : 'File a New Complaint'}</h3>
            <div>
              <label htmlFor="issue" className="block text-sm font-medium text-text-light dark:text-text-dark">Issue Type</label>
              <select
                id="issue"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-background-light dark:bg-slate-700 text-text-light dark:text-text-dark border border-border-light dark:border-border-dark rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Select an issue</option>
                <option>Missed Pickup</option>
                <option>Driver Behavior</option>
                <option>Payment Issue</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="details" className="block text-sm font-medium text-text-light dark:text-text-dark">Details</label>
              <textarea
                id="details"
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-background-light dark:bg-slate-700 text-text-light dark:text-text-dark border border-border-light dark:border-border-dark rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Please provide as much detail as possible."
              />
            </div>
            <div>
              <label htmlFor="photo" className="block text-sm font-medium text-text-light dark:text-text-dark">Upload Photo (Optional)</label>
               <div className="mt-1 flex items-center space-x-2">
                 <label className="cursor-pointer bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-text-light dark:text-text-dark font-bold py-2 px-4 rounded-lg inline-flex items-center">
                    <Paperclip size={16} className="mr-2"/>
                    <span>{photo ? photo.name : "Choose File"}</span>
                    <input type="file" id="photo" className="hidden" onChange={handlePhotoChange} accept="image/*" />
                 </label>
               </div>
               {photoPreview && (
                    <div className="mt-2">
                        <img src={photoPreview} alt="Preview" className="h-24 w-24 object-cover rounded-md" />
                    </div>
                )}
            </div>
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={clearAndCloseForm} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-glow-primary">Submit</button>
            </div>
          </form>
        </div>
      )}

      <h3 className="text-xl font-semibold text-heading-light dark:text-heading-dark mb-3">Your Complaint History</h3>
      {complaints.length === 0 ? (
        <p className="text-text-light dark:text-text-dark">No complaints filed.</p>
      ) : (
        <ul className="space-y-3">
          {complaints.map((c, index) => (
            <li key={c.id} className="bg-card-light dark:bg-card-dark p-4 rounded-lg shadow-md border border-border-light dark:border-border-dark animate-fade-in-up" style={{ animationDelay: `${index * 75}ms` }}>
              <div className="flex justify-between items-start">
                  <div className="flex-grow pr-4">
                    <p className="font-bold text-heading-light dark:text-heading-dark">{c.issue}</p>
                    <p className="text-sm text-text-light dark:text-text-dark mt-1 break-words">{c.details}</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center space-x-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(c.status)}`}>{c.status}</span>
                    {c.status !== 'Resolved' && (
                        <button onClick={() => handleEditClick(c)} className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary rounded-full transition" aria-label="Edit complaint">
                            <Pencil size={16} />
                        </button>
                    )}
                  </div>
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500 mt-2 border-t border-border-light dark:border-border-dark pt-2 flex justify-between">
                <span>ID: {c.id}</span>
                <span>{c.date.toLocaleDateString()}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ComplaintsComponent;