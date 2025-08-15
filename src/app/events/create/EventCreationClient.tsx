'use client';

import { useState, useEffect } from "react";
import { Save, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function EventCreationClient() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [minStartDate, setMinStartDate] = useState('');
  const [maxEndDate, setMaxEndDate] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: '',
    theme: 'General',
    discord_server_link: '',
    start_date: '',
    end_date: '',
    max_teams: 50,
    max_team_size: 3,
    votes_per_user: 3,
    prize: 'Learning Experience & Recognition'
  });

  // Set minimum start date (1 hour from now)
  useEffect(() => {
    const now = new Date();
    const minDate = new Date(now.getTime() + 60 * 60 * 1000); // Add 1 hour
    const minDateString = minDate.toISOString().slice(0, 16); // Format for datetime-local input
    setMinStartDate(minDateString);
  }, []);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Update max end date when start date changes
    if (field === 'start_date' && value) {
      const startDate = new Date(value as string);
      const maxEndDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later
      const maxEndDateString = maxEndDate.toISOString().slice(0, 16); // Format for datetime-local input
      setMaxEndDate(maxEndDateString);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Event name is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Event description is required');
      return false;
    }
    if (!formData.start_date) {
      setError('Start date is required');
      return false;
    }
    if (!formData.end_date) {
      setError('End date is required');
      return false;
    }

    // Validate start date is at least 1 hour from now
    const now = new Date();
    const startDate = new Date(formData.start_date);
    const minStartDate = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    
    if (startDate < minStartDate) {
      setError('Start date must be at least 1 hour from now');
      return false;
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      setError('End date must be after start date');
      return false;
    }

    // Validate end date is at most 7 days after start date
    const endDate = new Date(formData.end_date);
    const maxDuration = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const actualDuration = endDate.getTime() - startDate.getTime();
    
    if (actualDuration > maxDuration) {
      setError('End date cannot be more than 7 days after the start date');
      return false;
    }
    if (formData.max_team_size < 1 || formData.max_team_size > 10) {
      setError('Team size must be between 1 and 10');
      return false;
    }
    if (formData.max_teams < 1 || formData.max_teams > 1000) {
      setError('Maximum teams must be between 1 and 1000');
      return false;
    }
    if (formData.votes_per_user < 1 || formData.votes_per_user > 10) {
      setError('Votes per user must be between 1 and 10');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be logged in to create an event');
      return;
    }

    // Basic admin check - in a real app, you'd check user roles/permissions
    // For now, we'll allow any logged-in user to create events
    // You can add role-based checks here later

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      // Create event
      const eventData = {
        name: formData.name,
        description: formData.description,
        rules: formData.rules,
        votes_per_user: formData.votes_per_user,
        start_date: formData.start_date,
        end_date: formData.end_date,
        prize: formData.prize,
        discord_server_link: formData.discord_server_link || null,
        owner_id: user.id
      };
      
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();

      if (eventError) {
        throw eventError;
      }
      
      setSuccess('Event created successfully!');
      
      // Redirect to the new event page after a short delay
      setTimeout(() => {
        router.push(`/events/${event.id}`);
      }, 2000);

    } catch (error) {
      console.error('Error creating event:', error);
      setError('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/events"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
        <p className="text-gray-600 mt-2">
          Set up a new hackathon event for participants to join
        </p>
        {user && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> You&apos;re creating this event as {user.user_metadata?.full_name || user.email}. 
                              You&apos;ll be able to manage this event after creation.
            </p>
          </div>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <X className="w-5 h-5 text-red-600 mr-3" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <Save className="w-5 h-5 text-green-600 mr-3" />
          <span className="text-green-800">{success}</span>
        </div>
      )}

      <div className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            <p className="text-gray-600">Essential details about your hackathon</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Enter event name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Describe your hackathon event"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <input
                  type="text"
                  value={formData.theme}
                  onChange={(e) => handleInputChange('theme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="e.g., AI, Sustainability, Healthcare"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discord Server Link
                </label>
                <input
                  type="url"
                  value={formData.discord_server_link}
                  onChange={(e) => handleInputChange('discord_server_link', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="https://discord.gg/your-server-invite"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Link to your event's Discord server
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Event Dates</h2>
            <p className="text-gray-600">Set start and end dates for your hackathon</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  min={minStartDate}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 1 hour from now
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  min={formData.start_date || undefined}
                  max={maxEndDate || undefined}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be after start date and within 7 days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Settings */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Team Settings</h2>
            <p className="text-gray-600">Configure team size and participation limits</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Team Size
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.max_team_size}
                  onChange={(e) => handleInputChange('max_team_size', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">1-10 members per team</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Teams
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.max_teams}
                  onChange={(e) => handleInputChange('max_teams', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum number of teams</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votes per User
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.votes_per_user}
                  onChange={(e) => handleInputChange('votes_per_user', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">For judging phase</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prize */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Prize</h2>
            <p className="text-gray-600">What will participants win? Focus on learning and recognition rather than cash prizes</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prize Description
                </label>
                <textarea
                  value={formData.prize}
                  onChange={(e) => handleInputChange('prize', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="e.g., Learning Experience & Recognition, Mentorship Opportunities, Certificate of Achievement, Featured on our Blog, etc."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Examples: &quot;Learning Experience &amp; Recognition&quot;, &quot;Mentorship with Industry Experts&quot;, &quot;Certificate of Achievement&quot;, &quot;Featured Project Showcase&quot;
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rules */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Rules & Guidelines</h2>
            <p className="text-gray-600">Set competition rules and guidelines</p>
          </CardHeader>
          <CardContent>
            <textarea
              value={formData.rules}
              onChange={(e) => handleInputChange('rules', e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Enter competition rules and guidelines..."
            />
            <p className="text-xs text-gray-500 mt-2">
              Use line breaks to separate different rules
            </p>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Link href="/events">
            <Button variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleSubmit}
            variant="primary"
            disabled={loading}
            className="flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Create Event</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 