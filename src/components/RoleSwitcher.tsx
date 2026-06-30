import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Users, Shield, ArrowRightLeft, Sparkles } from 'lucide-react';

interface RoleSwitcherProps {
  currentUser: User;
  users: User[];
  onSwitchUser: (user: User) => void;
  onUpdateRole: (userId: string, targetRole: UserRole) => Promise<void>;
}

export default function RoleSwitcher({ currentUser, users, onSwitchUser, onUpdateRole }: RoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [promotingUserId, setPromotingUserId] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState<UserRole>('Editor');

  const handleRoleElevate = async (userId: string) => {
    await onUpdateRole(userId, targetRole);
    setPromotingUserId(null);
  };

  return (
    <div className="relative" id="role-switcher-container">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium hover:from-sky-600 hover:to-blue-700 transition-all shadow-md cursor-pointer text-sm"
        id="btn-switch-persona"
      >
        <ArrowRightLeft className="w-4 h-4 animate-pulse" />
        <span>Persona: <strong>{currentUser.name}</strong> ({currentUser.role})</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Simulate User Identity</span>
            </h3>
            <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-slate-50 text-slate-500">
              RBAC Sandbox
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-3">
            Switch your active profile to test strict task ownership rules and workflow stages.
          </p>

          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {users.map((u) => {
              const isActive = u.id === currentUser.id;
              return (
                <div
                  key={u.id}
                  className={`flex flex-col p-2.5 rounded-lg border transition-all ${isActive
                      ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-sm'
                      : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        onSwitchUser(u);
                        setIsOpen(false);
                      }}
                      className="text-left font-medium text-sm flex-1 cursor-pointer"
                      id={`user-select-${u.id}`}
                    >
                      {u.name}
                      {isActive && <span className="ml-1.5 text-[10px] text-blue-600 font-semibold">• Active</span>}
                    </button>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${u.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'Senior Editor' ? 'bg-[#20a6eb]/10 text-[#20a6eb]' :
                          u.role === 'Editor' ? 'bg-indigo-100 text-indigo-700' :
                            u.role === 'Quality Checker' ? 'bg-amber-100 text-amber-700' :
                              u.role === 'Publisher' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-slate-100 text-slate-700'
                      }`}>
                      {u.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{u.email}</div>

                  {/* Promotion Panel directly inside list for ease of manual data tweaks! */}
                  <div className="mt-2 pt-2 border-t border-dashed border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setPromotingUserId(promotingUserId === u.id ? null : u.id)}
                      className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Shield className="w-3 h-3" />
                      Change Role
                    </button>
                    {promotingUserId === u.id && (
                      <div className="flex items-center gap-1">
                        <select
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value as UserRole)}
                          className="text-[10px] border border-slate-200 rounded p-0.5 bg-slate-50 text-slate-600 cursor-pointer"
                        >
                          <option value="Writer">Writer</option>
                          <option value="Editor">Editor</option>
                          <option value="Senior Editor">Senior Editor</option>
                          <option value="Quality Checker">Quality Checker</option>
                          <option value="Publisher">Publisher</option>
                          <option value="Admin">Admin</option>
                        </select>
                        <button
                          onClick={() => handleRoleElevate(u.id)}
                          className="bg-emerald-600 text-white font-medium rounded px-1.5 py-0.5 text-[10px] hover:bg-emerald-700 cursor-pointer flex items-center gap-0.5"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          Apply
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[9.5px] text-slate-400 mt-3 text-center border-t border-slate-100 pt-2 font-mono">
            * Strict limits block multiple editors reviewing the same article.
          </div>
        </div>
      )}
    </div>
  );
}
