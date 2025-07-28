'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Github, ExternalLink, FileText, Save, AlertTriangle } from "lucide-react";
import { EventWithDetails } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";

interface ProjectSubmissionClientProps {
  event: EventWithDetails;
  eventId: string;
}

interface Submission {
  id: string;
  team_id: string;
  event_id: string;
  repo_url?: string;
  demo_url?: string;
  description?: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  votes: number;
}

export function ProjectSubmissionClient({ event, eventId }: ProjectSubmissionClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [myTeam, setMyTeam] = useState<any>(null);
  const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null);
  const [isTeamCaptain, setIsTeamCaptain] = useState(false);

  const [formData, setFormData] = useState({
    repo_url: '',
    demo_url: '',
    description: ''
  });

  useEffect(() => {
    if (user?.id) {
      checkTeamAndSubmission();
    }
  }, [user?.id, eventId]);

  const checkTeamAndSubmission = async () => {
    const supabase = createClient();
    
    try {
      console.log('Checking team and submission for user:', user?.id);
      console.log('Event ID:', eventId);
      
      // Get user's teams
      const { data: teamMemberships } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user?.id);

      console.log('Team memberships:', teamMemberships);

      const teamIds = teamMemberships?.map(tm => tm.team_id) || [];

      if (teamIds.length > 0) {
        // Check if any of user's teams are registered for this event
        const { data: registrations } = await supabase
          .from('registrations')
          .select('team_id')
          .eq('event_id', eventId)
          .in('team_id', teamIds);

        console.log('Event registrations:', registrations);

        if (registrations && registrations.length > 0) {
          // Get the team details
          const { data: teamData } = await supabase
            .from('teams')
            .select('*')
            .eq('id', registrations[0].team_id)
            .single();

          console.log('Team data:', teamData);
          setMyTeam(teamData);

          // Check if user is the team captain (owner)
          if (teamData && teamData.owner_id === user?.id) {
            console.log('User is team captain');
            setIsTeamCaptain(true);
          } else {
            console.log('User is not team captain. Team owner:', teamData?.owner_id, 'User:', user?.id);
          }

          // Check for existing submission
          const { data: submission } = await supabase
            .from('submissions')
            .select('*')
            .eq('team_id', teamData.id)
            .eq('event_id', eventId)
            .single();

          console.log('Existing submission:', submission);

          if (submission) {
            setExistingSubmission(submission);
            setFormData({
              repo_url: submission.repo_url || '',
              demo_url: submission.demo_url || '',
              description: submission.description || ''
            });
          }
        } else {
          console.log('No registrations found for this event');
        }
      } else {
        console.log('No team memberships found');
      }
    } catch (error) {
      console.error('Error checking team and submission:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.description.trim()) {
      setError('Project description is required');
      return false;
    }
    if (!formData.repo_url.trim() && !formData.demo_url.trim()) {
      setError('At least one of repository URL or demo URL is required');
      return false;
    }
    if (formData.repo_url.trim() && !isValidUrl(formData.repo_url)) {
      setError('Please enter a valid repository URL');
      return false;
    }
    if (formData.demo_url.trim() && !isValidUrl(formData.demo_url)) {
      setError('Please enter a valid demo URL');
      return false;
    }
    return true;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!user || !myTeam) {
      setError('You must be logged in and part of a team to submit a project');
      return;
    }

    if (!isTeamCaptain) {
      setError('Only the team captain can submit the project');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      
      const submissionData = {
        team_id: myTeam.id,
        event_id: eventId,
        repo_url: formData.repo_url.trim() || null,
        demo_url: formData.demo_url.trim() || null,
        description: formData.description.trim(),
        submitted_at: new Date().toISOString()
      };

      console.log('Submitting project with data:', submissionData);
      console.log('User ID:', user.id);
      console.log('Team ID:', myTeam.id);
      console.log('Event ID:', eventId);

      let result;
      if (existingSubmission) {
        // Update existing submission
        console.log('Updating existing submission:', existingSubmission.id);
        result = await supabase
          .from('submissions')
          .update(submissionData)
          .eq('id', existingSubmission.id)
          .select()
          .single();
      } else {
        // Create new submission
        console.log('Creating new submission');
        result = await supabase
          .from('submissions')
          .insert(submissionData)
          .select()
          .single();
      }

      console.log('Supabase result:', result);

      if (result.error) {
        console.error('Supabase error:', result.error);
        throw result.error;
      }

      console.log('Submission successful:', result.data);

      setSuccess(existingSubmission ? 'Project updated successfully!' : 'Project submitted successfully!');
      
      // Redirect to event details page after a short delay
      setTimeout(() => {
        router.push(`/events/${eventId}`);
      }, 2000);

    } catch (error) {
      console.error('Error submitting project:', error);
      setError('Failed to submit project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!myTeam) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Submit Project" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Not Registered</h2>
                <p className="text-gray-600 mb-6">
                  You need to be registered for this event with a team to submit a project.
                </p>
                <Button href={`/events/${eventId}/register`} variant="primary">
                  Register for Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isTeamCaptain) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Submit Project" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Team Captain Only</h2>
                <p className="text-gray-600 mb-6">
                  Only the team captain can submit the project. Please contact your team captain to submit the project.
                </p>
                <Button href={`/events/${eventId}`} variant="outline">
                  Back to Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title={existingSubmission ? "Edit Project Submission" : "Submit Project"}
        action={{
          label: "Back to Event",
          href: `/events/${eventId}`,
          variant: "outline"
        }}
      >
        <Link 
          href={`/events/${eventId}`} 
          className="text-gray-600 hover:text-gray-900 ml-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </PageHeader>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Info */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Event Information</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900">{event.name}</h3>
                <p className="text-sm text-gray-600">{event.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">End Date</p>
                <p className="font-medium text-gray-900">{formatDate(event.end_date)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Info */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Team Information</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900">{myTeam.name}</h3>
                <p className="text-sm text-gray-600">{myTeam.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Team Captain</p>
                <p className="font-medium text-gray-900">You</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <Save className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {/* Submission Form */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">
              {existingSubmission ? "Edit Project Submission" : "Project Submission"}
            </h2>
            <p className="text-gray-600">
              {existingSubmission 
                ? "Update your project details below" 
                : "Submit your project details below"
              }
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repository URL
                </label>
                <div className="relative">
                  <Github className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={formData.repo_url}
                    onChange={(e) => handleInputChange('repo_url', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="https://github.com/username/project"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Link to your project&apos;s source code repository
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Demo URL
                </label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={formData.demo_url}
                    onChange={(e) => handleInputChange('demo_url', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="https://your-demo-url.com"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Link to your live demo or deployed application
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={6}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Describe your project, what it does, the technologies used, and any notable features..."
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Provide a detailed description of your project
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  href={`/events/${eventId}`}
                  variant="outline"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  variant="primary"
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{existingSubmission ? 'Updating...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{existingSubmission ? 'Update Project' : 'Submit Project'}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 