'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, Plus, X, CheckCircle, AlertCircle } from "lucide-react";
import { EventWithDetails } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface EventRegistrationClientProps {
  event: EventWithDetails;
  eventId: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export function EventRegistrationClient({ event, eventId }: EventRegistrationClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<'team' | 'members' | 'confirm'>('team');
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add current user as first member
  useEffect(() => {
    if (user && members.length === 0) {
      setMembers([{
        id: user.id,
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'User',
        email: user.email || '',
        avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture
      }]);
    }
  }, [user, members.length]);

  const addMember = () => {
    if (!newMemberEmail.trim()) return;
    
    // Check if member already exists
    if (members.some(m => m.email === newMemberEmail.trim())) {
      setError('This member is already in the team');
      return;
    }

    // Check team size limit
    if (members.length >= event.max_team_size) {
      setError(`Team size cannot exceed ${event.max_team_size} members`);
      return;
    }

    setMembers([...members, {
      id: `temp-${Date.now()}`,
      name: newMemberEmail.split('@')[0], // Use email prefix as name
      email: newMemberEmail.trim()
    }]);
    setNewMemberEmail('');
    setError('');
  };

  const removeMember = (memberId: string) => {
    // Don't allow removing the team owner (current user)
    if (memberId === user?.id) return;
    
    setMembers(members.filter(m => m.id !== memberId));
  };

  const handleNext = () => {
    if (step === 'team') {
      if (!teamName.trim()) {
        setError('Please enter a team name');
        return;
      }
      setStep('members');
    } else if (step === 'members') {
      setStep('confirm');
    }
  };

  const handleBack = () => {
    if (step === 'members') {
      setStep('team');
    } else if (step === 'confirm') {
      setStep('members');
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be logged in to register');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      // Create team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: teamName,
          description: teamDescription,
          owner_id: user.id
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add team members (only current user for now, others will be invited via email)
      const { error: membersError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id
        });

      if (membersError) throw membersError;

      // Register team for event
      const { error: registrationError } = await supabase
        .from('registrations')
        .insert({
          team_id: team.id,
          event_id: eventId
        });

      if (registrationError) throw registrationError;

      setSuccess('Team registered successfully!');
      
      // Redirect to event page after a short delay
      setTimeout(() => {
        router.push(`/events/${eventId}`);
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      setError('Failed to register team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href={`/events/${eventId}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Event
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Register for {event.name}</h1>
        <p className="text-gray-600 mt-2">
          Register up to the start of the event
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${step === 'team' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step === 'team' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
            }`}>
              1
            </div>
            <span className="ml-2 font-medium">Team Info</span>
          </div>
          <div className={`w-12 h-0.5 ${step === 'members' || step === 'confirm' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center ${step === 'members' ? 'text-blue-600' : step === 'confirm' ? 'text-gray-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step === 'members' ? 'border-blue-600 bg-blue-600 text-white' : 
              step === 'confirm' ? 'border-gray-600 bg-gray-600 text-white' : 'border-gray-300'
            }`}>
              2
            </div>
            <span className="ml-2 font-medium">Members</span>
          </div>
          <div className={`w-12 h-0.5 ${step === 'confirm' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center ${step === 'confirm' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step === 'confirm' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
            }`}>
              3
            </div>
            <span className="ml-2 font-medium">Confirm</span>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
          <span className="text-green-800">{success}</span>
        </div>
      )}

      {/* Step 1: Team Information */}
      {step === 'team' && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Team Information</h2>
            <p className="text-gray-600">Create your team for this hackathon</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your team name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Description
                </label>
                <textarea
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your team's focus or expertise"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Event Details</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Maximum team size: {event.max_team_size} members</p>
                  <p>• Event theme: {event.theme}</p>
                  <p>• Event dates: {formatDate(event.start_date)} - {formatDate(event.end_date)}</p>
                  <p>• Prize: {event.prize || 'Learning Experience & Recognition'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Team Members */}
      {step === 'members' && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
            <p className="text-gray-600">
                              Add team members (you&apos;re already included as the team leader)
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Current Members */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Current Members ({members.length}/{event.max_team_size})</h3>
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {member.avatar ? (
                          <Image src={member.avatar} alt={member.name} width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                      {member.id === user?.id ? (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Team Leader</span>
                      ) : (
                        <button
                          onClick={() => removeMember(member.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Member */}
              {members.length < event.max_team_size && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Add Team Member</h3>
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addMember()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter member's email address"
                    />
                    <Button
                      onClick={addMember}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Team members will be added to your team. You can invite additional members after registration.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirmation */}
      {step === 'confirm' && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Confirm Registration</h2>
            <p className="text-gray-600">Review your team details before registering</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Team Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Team Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Team Name:</span>
                    <span className="font-medium">{teamName}</span>
                  </div>
                  {teamDescription && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Description:</span>
                      <span className="font-medium">{teamDescription}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Members:</span>
                    <span className="font-medium">{members.length}/{event.max_team_size}</span>
                  </div>
                </div>
              </div>

              {/* Event Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-3">Event Summary</h3>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex justify-between">
                    <span>Event:</span>
                    <span className="font-medium">{event.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Start Date:</span>
                    <span className="font-medium">{formatDate(event.start_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>End Date:</span>
                    <span className="font-medium">{formatDate(event.end_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prize:</span>
                    <span className="font-medium">{event.prize || 'Learning Experience & Recognition'}</span>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-yellow-900 mb-2">Important Notes</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• You&apos;ll be the team leader and can manage team members</li>
                  <li>• You can invite additional members after registration</li>
                  <li>• You can modify your team until the registration deadline</li>
                  <li>• Make sure all team members have Discord accounts for communication</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          onClick={handleBack}
          variant="outline"
          disabled={step === 'team'}
        >
          Back
        </Button>
        
        <div className="flex space-x-3">
          {step === 'confirm' ? (
            <Button
              onClick={handleSubmit}
              variant="primary"
              disabled={loading}
              className="flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Register Team</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              variant="primary"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 