'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Users, Trophy, Clock, MapPin, DollarSign, Plus, X, Save } from "lucide-react";
import { EventWithDetails } from "@/lib/types";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase";

interface EventEditClientProps {
  event: EventWithDetails;
  eventId: string;
}

interface Prize {
  place: string;
  amount: string;
  description: string;
}

interface ScheduleItem {
  time: string;
  event: string;
}

export function EventEditClient({ event, eventId }: EventEditClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state - pre-populated with event data
  const [formData, setFormData] = useState({
    name: event.name,
    description: event.description || '',
    rules: event.rules || '',
    theme: event.theme,
    location: event.location,
    start_date: event.start_date,
    end_date: event.end_date,
    registration_deadline: event.registration_deadline,
    submission_deadline: event.submission_deadline,
    max_teams: event.max_teams,
    max_team_size: event.max_team_size,
    votes_per_user: event.votes_per_user,
    prize_pool: event.prize_pool
  });

  const [prizes, setPrizes] = useState<Prize[]>(event.prizes);
  const [schedule, setSchedule] = useState<ScheduleItem[]>(event.schedule);

  // Format dates for datetime-local inputs
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  // Initialize form with proper date formatting
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      start_date: formatDateForInput(event.start_date),
      end_date: formatDateForInput(event.end_date),
      registration_deadline: formatDateForInput(event.registration_deadline),
      submission_deadline: formatDateForInput(event.submission_deadline)
    }));
  }, [event]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addPrize = () => {
    setPrizes([...prizes, { place: '', amount: '', description: '' }]);
  };

  const updatePrize = (index: number, field: keyof Prize, value: string) => {
    const updatedPrizes = [...prizes];
    updatedPrizes[index] = { ...updatedPrizes[index], [field]: value };
    setPrizes(updatedPrizes);
  };

  const removePrize = (index: number) => {
    setPrizes(prizes.filter((_, i) => i !== index));
  };

  const addScheduleItem = () => {
    setSchedule([...schedule, { time: '', event: '' }]);
  };

  const updateScheduleItem = (index: number, field: keyof ScheduleItem, value: string) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[index] = { ...updatedSchedule[index], [field]: value };
    setSchedule(updatedSchedule);
  };

  const removeScheduleItem = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
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
    if (!formData.registration_deadline) {
      setError('Registration deadline is required');
      return false;
    }
    if (!formData.submission_deadline) {
      setError('Submission deadline is required');
      return false;
    }
    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      setError('End date must be after start date');
      return false;
    }
    if (new Date(formData.registration_deadline) >= new Date(formData.start_date)) {
      setError('Registration deadline must be before start date');
      return false;
    }
    if (new Date(formData.submission_deadline) > new Date(formData.end_date)) {
      setError('Submission deadline cannot be after end date');
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
      setError('You must be logged in to edit an event');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      // Update event
      const { error: eventError } = await supabase
        .from('events')
        .update({
          name: formData.name,
          description: formData.description,
          rules: formData.rules,
          votes_per_user: formData.votes_per_user,
          start_date: formData.start_date,
          end_date: formData.end_date
        })
        .eq('id', eventId);

      if (eventError) throw eventError;

      setSuccess('Event updated successfully!');
      
      // Redirect to the event page after a short delay
      setTimeout(() => {
        router.push(`/events/${eventId}`);
      }, 2000);

    } catch (error) {
      console.error('Error updating event:', error);
      setError('Failed to update event. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
        <p className="text-gray-600 mt-2">
          Update your hackathon event details
        </p>
        {user && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> You're editing this event as {user.user_metadata?.full_name || user.email}. 
              Changes will be reflected immediately.
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., AI, Sustainability, Healthcare"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Virtual, San Francisco, etc."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates and Schedule */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Dates & Schedule</h2>
            <p className="text-gray-600">Set important dates and timeline</p>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Deadline *
                </label>
                <input
                  type="datetime-local"
                  value={formData.registration_deadline}
                  onChange={(e) => handleInputChange('registration_deadline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submission Deadline *
                </label>
                <input
                  type="datetime-local"
                  value={formData.submission_deadline}
                  onChange={(e) => handleInputChange('submission_deadline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Schedule Items */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Event Schedule</h3>
                <Button
                  onClick={addScheduleItem}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </Button>
              </div>
              <div className="space-y-3">
                {schedule.map((item, index) => (
                  <div key={index} className="flex space-x-3">
                    <input
                      type="text"
                      value={item.time}
                      onChange={(e) => updateScheduleItem(index, 'time', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Day 1 - 9:00 AM"
                    />
                    <input
                      type="text"
                      value={item.event}
                      onChange={(e) => updateScheduleItem(index, 'event', e.target.value)}
                      className="flex-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Opening Ceremony"
                    />
                    <button
                      onClick={() => removeScheduleItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">For judging phase</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prizes */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Prizes</h2>
            <p className="text-gray-600">Set up prizes for winners</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prizes.map((prize, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={prize.place}
                    onChange={(e) => updatePrize(index, 'place', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1st Place"
                  />
                  <input
                    type="text"
                    value={prize.amount}
                    onChange={(e) => updatePrize(index, 'amount', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., $3,000"
                  />
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={prize.description}
                      onChange={(e) => updatePrize(index, 'description', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Best overall project"
                    />
                    <button
                      onClick={() => removePrize(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <Button
                onClick={addPrize}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Prize</span>
              </Button>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter competition rules and guidelines..."
            />
            <p className="text-xs text-gray-500 mt-2">
              Use line breaks to separate different rules
            </p>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Link href={`/events/${eventId}`}>
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
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Update Event</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 