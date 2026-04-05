'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PersonalRecord } from '@/types';

const ACHIEVEMENT_BADGES = [
  { icon: 'local_fire_department', label: '30-Day Streak', color: 'primary', threshold: 30 },
  { icon: 'bolt', label: 'Power Hour', color: 'secondary', threshold: 10 },
  { icon: 'diamond', label: 'Elite Status', color: 'tertiary', threshold: 100 },
  { icon: 'military_tech', label: 'Champion', color: 'primary', threshold: 50 },
];

const WORKOUT_TYPES = [
  { id: 'hiit', icon: 'fitness_center', label: 'HIIT', color: 'secondary' },
  { id: 'yoga', icon: 'self_improvement', label: 'Yoga', color: 'primary' },
  { id: 'cardio', icon: 'directions_run', label: 'Cardio', color: 'tertiary' },
  { id: 'strength', icon: 'exercise', label: 'Strength', color: 'secondary' },
  { id: 'stretching', icon: 'accessibility_new', label: 'Stretching', color: 'primary' },
  { id: 'meditation', icon: 'spa', label: 'Meditation', color: 'tertiary' },
];

export default function ProfilePage() {
  const { 
    user, 
    stats, 
    personalRecords, 
    signOut, 
    isGuest, 
    isLoading,
    updateProfile,
    addPersonalRecord,
    deletePersonalRecord,
    updateStats,
  } = useAuth();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  
  // Edit form states
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [selectedWorkoutTypes, setSelectedWorkoutTypes] = useState<string[]>(['hiit', 'cardio']);
  
  // Stats edit states
  const [editStats, setEditStats] = useState({
    lifetimeTotalTime: stats.lifetimeTotalTime,
    totalCaloriesBurnt: stats.totalCaloriesBurnt,
    workoutsCompleted: stats.workoutsCompleted,
    currentStreak: stats.currentStreak,
    monthlyGoalHours: stats.monthlyGoalHours,
    monthlyCompletedHours: stats.monthlyCompletedHours,
  });
  
  // New record states
  const [newRecord, setNewRecord] = useState<Partial<PersonalRecord>>({
    category: '',
    value: 0,
    unit: '',
    trend: 'stable',
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="pb-16 px-6 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-secondary animate-spin">
            progress_activity
          </span>
          <p className="text-on-surface-variant mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Default values for guest or not-signed-in users
  const displayUser = user || {
    id: 'guest',
    name: 'Guest User',
    email: null,
    role: 'guest' as const,
    image: null,
    createdAt: new Date(),
    isGuest: true,
  };

  const handleSaveProfile = async () => {
    await updateProfile({ name: editName, email: editEmail || undefined });
    setIsEditingProfile(false);
  };

  const handleSaveStats = async () => {
    await updateStats(editStats);
    setIsEditingStats(false);
  };

  const handleAddRecord = async () => {
    if (!newRecord.category || !newRecord.unit) return;
    await addPersonalRecord({
      category: newRecord.category,
      value: newRecord.value || 0,
      unit: newRecord.unit,
      trend: newRecord.trend || 'stable',
    });
    setNewRecord({ category: '', value: 0, unit: '', trend: 'stable' });
    setIsAddingRecord(false);
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      await deletePersonalRecord(recordId);
    }
  };

  const toggleWorkoutType = (typeId: string) => {
    setSelectedWorkoutTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    );
  };

  // Calculate earned badges based on stats
  const earnedBadges = ACHIEVEMENT_BADGES.filter(badge => {
    if (badge.label === '30-Day Streak') return stats.currentStreak >= 30;
    if (badge.label === 'Power Hour') return stats.workoutsCompleted >= 10;
    if (badge.label === 'Elite Status') return stats.workoutsCompleted >= 100;
    if (badge.label === 'Champion') return stats.workoutsCompleted >= 50;
    return false;
  });

  return (
    <div className="pb-16 px-6 max-w-7xl mx-auto">
      {/* Hero Header */}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <p className="text-secondary font-label uppercase tracking-widest text-sm mb-2">
              {displayUser.role === 'guest' || isGuest ? 'Guest User' : 'Athlete Profile'}
            </p>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
              {displayUser.name || 'GUEST'} <span className="text-primary-dim">KINETIC</span>
            </h1>
          </div>
          <div className="flex gap-4">
            <button
              className="bg-surface-container-low hover:bg-surface-container px-6 py-4 rounded-lg flex items-center gap-4 border-l-4 border-secondary transition-colors"
              onClick={() => {
                setEditName(displayUser.name || '');
                setEditEmail(displayUser.email || '');
                setIsEditingProfile(true);
              }}
            >
              <span className="material-symbols-outlined text-secondary">edit</span>
              <span className="font-bold uppercase tracking-widest text-sm">Edit Profile</span>
            </button>
          </div>
        </div>
      </header>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-surface-container-highest rounded-lg p-4 text-on-surface focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-surface-container-highest rounded-lg p-4 text-on-surface focus:ring-2 focus:ring-primary outline-none"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="flex-1 py-3 rounded-lg bg-surface-container-highest text-on-surface font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 py-3 rounded-lg bg-primary text-on-primary font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Stats Modal */}
      {isEditingStats && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Edit Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">
                  Total Hours
                </label>
                <input
                  type="number"
                  value={editStats.lifetimeTotalTime}
                  onChange={(e) => setEditStats(prev => ({ ...prev, lifetimeTotalTime: Number(e.target.value) }))}
                  className="w-full bg-surface-container-highest rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">
                  Calories Burnt
                </label>
                <input
                  type="number"
                  value={editStats.totalCaloriesBurnt}
                  onChange={(e) => setEditStats(prev => ({ ...prev, totalCaloriesBurnt: Number(e.target.value) }))}
                  className="w-full bg-surface-container-highest rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">
                  Workouts
                </label>
                <input
                  type="number"
                  value={editStats.workoutsCompleted}
                  onChange={(e) => setEditStats(prev => ({ ...prev, workoutsCompleted: Number(e.target.value) }))}
                  className="w-full bg-surface-container-highest rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">
                  Current Streak
                </label>
                <input
                  type="number"
                  value={editStats.currentStreak}
                  onChange={(e) => setEditStats(prev => ({ ...prev, currentStreak: Number(e.target.value) }))}
                  className="w-full bg-surface-container-highest rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">
                  Monthly Goal (hrs)
                </label>
                <input
                  type="number"
                  value={editStats.monthlyGoalHours}
                  onChange={(e) => setEditStats(prev => ({ ...prev, monthlyGoalHours: Number(e.target.value) }))}
                  className="w-full bg-surface-container-highest rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">
                  Monthly Done (hrs)
                </label>
                <input
                  type="number"
                  value={editStats.monthlyCompletedHours}
                  onChange={(e) => setEditStats(prev => ({ ...prev, monthlyCompletedHours: Number(e.target.value) }))}
                  className="w-full bg-surface-container-highest rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setIsEditingStats(false)}
                className="flex-1 py-3 rounded-lg bg-surface-container-highest text-on-surface font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStats}
                className="flex-1 py-3 rounded-lg bg-primary text-on-primary font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Record Modal */}
      {isAddingRecord && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Add Personal Record</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">
                  Category
                </label>
                <input
                  type="text"
                  value={newRecord.category}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-surface-container-highest rounded-lg p-4 text-on-surface focus:ring-2 focus:ring-primary outline-none"
                  placeholder="e.g., Deadlift Max, 5K Run Time"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">
                    Value
                  </label>
                  <input
                    type="number"
                    value={newRecord.value}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, value: Number(e.target.value) }))}
                    className="w-full bg-surface-container-highest rounded-lg p-4 text-on-surface focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={newRecord.unit}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full bg-surface-container-highest rounded-lg p-4 text-on-surface focus:ring-2 focus:ring-primary outline-none"
                    placeholder="KG, MIN, REPS"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">
                  Trend
                </label>
                <div className="flex gap-2">
                  {(['up', 'stable', 'down'] as const).map(trend => (
                    <button
                      key={trend}
                      onClick={() => setNewRecord(prev => ({ ...prev, trend }))}
                      className={`flex-1 py-2 rounded-lg font-bold capitalize ${
                        newRecord.trend === trend ? 'bg-primary text-on-primary' : 'bg-surface-container-highest'
                      }`}
                    >
                      {trend}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setIsAddingRecord(false)}
                className="flex-1 py-3 rounded-lg bg-surface-container-highest text-on-surface font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRecord}
                className="flex-1 py-3 rounded-lg bg-primary text-on-primary font-bold"
              >
                Add Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-4 bg-surface-container-low rounded-lg p-8 flex flex-col items-center text-center">
          <div className="w-32 h-32 rounded-full bg-surface-container-highest overflow-hidden mb-6 ring-4 ring-secondary/30">
            {displayUser.image ? (
              <img
                alt={displayUser.name || 'User'}
                className="w-full h-full object-cover"
                src={displayUser.image}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-black text-secondary">
                {displayUser.name?.[0]?.toUpperCase() || 'G'}
              </div>
            )}
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-1">{displayUser.name || 'Guest User'}</h2>
          <p className="text-on-surface-variant text-sm mb-4">{displayUser.email || 'Not signed in'}</p>
          
          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {ACHIEVEMENT_BADGES.map((badge, index) => {
              const earned = earnedBadges.includes(badge);
              return (
                <div
                  key={index}
                  className={`w-12 h-12 rounded-full flex items-center justify-center group hover:scale-110 transition-transform cursor-pointer ${
                    earned ? 'bg-surface-container' : 'bg-surface-container-highest opacity-30'
                  }`}
                  title={`${badge.label}${earned ? ' ✓' : ' (Locked)'}`}
                >
                  <span
                    className={`material-symbols-outlined ${earned ? `text-${badge.color}` : 'text-on-surface-variant'}`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {badge.icon}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 w-full">
            <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-2">
              Member Since
            </p>
            <p className="text-lg font-black">{new Date(displayUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="md:col-span-8 space-y-6">
          {/* Quick Stats */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold">Stats Overview</h3>
            <button
              onClick={() => {
                setEditStats({
                  lifetimeTotalTime: stats.lifetimeTotalTime,
                  totalCaloriesBurnt: stats.totalCaloriesBurnt,
                  workoutsCompleted: stats.workoutsCompleted,
                  currentStreak: stats.currentStreak,
                  monthlyGoalHours: stats.monthlyGoalHours,
                  monthlyCompletedHours: stats.monthlyCompletedHours,
                });
                setIsEditingStats(true);
              }}
              className="text-secondary text-sm flex items-center gap-1 hover:opacity-70"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Edit
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-container-low rounded-lg p-6">
              <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-2">
                Workouts
              </p>
              <p className="text-3xl font-black tracking-tighter">{stats.workoutsCompleted}</p>
            </div>
            <div className="bg-surface-container-low rounded-lg p-6">
              <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-2">
                Total Hours
              </p>
              <p className="text-3xl font-black tracking-tighter">{stats.lifetimeTotalTime}</p>
            </div>
            <div className="bg-surface-container-low rounded-lg p-6">
              <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-2">
                Streak
              </p>
              <p className="text-3xl font-black tracking-tighter text-primary">{stats.currentStreak}</p>
            </div>
            <div className="bg-surface-container-low rounded-lg p-6">
              <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-2">
                Calories
              </p>
              <p className="text-3xl font-black tracking-tighter">{stats.totalCaloriesBurnt.toLocaleString()}</p>
            </div>
          </div>

          {/* Personal Records */}
          <div className="bg-surface-container-low rounded-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold tracking-tight">Personal Records</h3>
              <button
                onClick={() => setIsAddingRecord(true)}
                className="text-secondary text-sm flex items-center gap-1 hover:opacity-70"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add Record
              </button>
            </div>
            {personalRecords.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2">emoji_events</span>
                <p>No personal records yet. Add your first one!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {personalRecords.map((record, index) => {
                  const icons = ['emoji_events', 'timer', 'whatshot', 'fitness_center', 'bolt'];
                  const colorClasses = ['bg-secondary/10 text-secondary', 'bg-primary/10 text-primary', 'bg-tertiary/10 text-tertiary'];
                  
                  return (
                    <div
                      key={record.id}
                      className="bg-surface-container rounded-lg p-6 flex items-center gap-4 group relative"
                    >
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="p-1 hover:bg-error/20 rounded text-error"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[index % 3].split(' ')[0]}`}
                      >
                        <span
                          className={`material-symbols-outlined ${colorClasses[index % 3].split(' ')[1]}`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {icons[index % icons.length]}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">
                          {record.category}
                        </p>
                        <p className="text-xl font-black">
                          {record.value} {record.unit}
                        </p>
                      </div>
                      <span className={`material-symbols-outlined ${
                        record.trend === 'up' ? 'text-green-500' : 
                        record.trend === 'down' ? 'text-red-500' : 'text-on-surface-variant'
                      }`}>
                        {record.trend === 'up' ? 'trending_up' : record.trend === 'down' ? 'trending_down' : 'trending_flat'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Training Preferences */}
          <div className="bg-surface-container-low rounded-lg p-8">
            <h3 className="text-xl font-bold tracking-tight mb-6">Training Preferences</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {WORKOUT_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => toggleWorkoutType(type.id)}
                  className={`bg-surface-container rounded-lg p-4 text-center transition-all ${
                    selectedWorkoutTypes.includes(type.id) 
                      ? 'ring-2 ring-primary scale-105' 
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <span className={`material-symbols-outlined text-${type.color} text-3xl mb-2`}>{type.icon}</span>
                  <p className="text-sm font-bold">{type.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="md:col-span-12 bg-surface-container-low rounded-lg p-8">
          <h3 className="text-xl font-bold tracking-tight mb-6">Account</h3>
          <div className="flex flex-wrap gap-4">
            {isGuest || !user ? (
              <>
                <a
                  href="/auth/signin"
                  className="kinetic-gradient px-8 py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity"
                >
                  Sign In with Google
                </a>
                <p className="text-on-surface-variant text-sm self-center">
                  Sign in to save your progress and sync across devices
                </p>
              </>
            ) : (
              <>
                <button
                  className="bg-surface-container hover:bg-surface-container-high px-8 py-4 rounded-lg font-bold uppercase tracking-widest text-sm transition-colors"
                  onClick={() => {
                    const data = {
                      user: displayUser,
                      stats,
                      personalRecords,
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'kinetic-profile-export.json';
                    a.click();
                  }}
                >
                  Export Data
                </button>
                <button
                  className="bg-error/10 hover:bg-error/20 text-error px-8 py-4 rounded-lg font-bold uppercase tracking-widest text-sm transition-colors"
                  onClick={signOut}
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
