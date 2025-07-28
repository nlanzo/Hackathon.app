import { Navigation } from "@/components/layout/Navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

export default function CreateTeamPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation showAuthButtons={false} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create Team</h1>
          <p className="text-gray-600 mt-2">
            Teams are created when you register for events
          </p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">How Teams Work</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Users className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Teams are Event-Specific</h3>
                  <p className="text-gray-600">
                    Teams are created automatically when you register for a hackathon event. 
                    You can't create a team without registering for an event first.
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Next Steps</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>1. Browse available hackathon events</p>
                  <p>2. Register for an event that interests you</p>
                  <p>3. Create your team during registration</p>
                  <p>4. Invite team members to join</p>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  href="/events"
                  variant="primary"
                  className="flex items-center space-x-2"
                >
                  <span>Browse Events</span>
                </Button>
                <Button
                  href="/dashboard"
                  variant="outline"
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 