'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, RotateCcw, Edit2 } from 'lucide-react';

interface SchoolInfo {
  name: string;
  principal: string;
  location: string;
  phone: string;
  email: string;
  established: string;
  board: string;
  affiliation: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'teacher' | 'parent';
  created_at: string;
}

const MOCK_SCHOOL_INFO: SchoolInfo = {
  name: 'Gokul Buds Preschool',
  principal: 'Dr. Priya Sharma',
  location: 'New Delhi',
  phone: '+91-11-1234-5678',
  email: 'info@gokul-buds.edu.in',
  established: '2010',
  board: 'CBSE',
  affiliation: 'AICTE',
};

const MOCK_USERS: User[] = [
  {
    id: 'u1',
    email: 'admin@gokul-buds.edu.in',
    full_name: 'Admin User',
    role: 'admin',
    created_at: '2024-01-01',
  },
  {
    id: 'u2',
    email: 'teacher1@gokul-buds.edu.in',
    full_name: 'John Teacher',
    role: 'teacher',
    created_at: '2024-02-15',
  },
  {
    id: 'u3',
    email: 'parent1@gokul-buds.edu.in',
    full_name: 'Parent User',
    role: 'parent',
    created_at: '2024-03-20',
  },
];

export default function SettingsPage() {
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(MOCK_SCHOOL_INFO);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSchool, setEditingSchool] = useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [userFormData, setUserFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    role: 'teacher' as const,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const supabase = createClient();

      // Fetch users from auth
      // In a real app, this would come from a users/profiles table
      setUsers(MOCK_USERS);

      // School info would be fetched from settings table or similar
      setSchoolInfo(MOCK_SCHOOL_INFO);
    } catch (error) {
      console.error('Error fetching data:', error);
      setUsers(MOCK_USERS);
      setSchoolInfo(MOCK_SCHOOL_INFO);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchoolInfo = async () => {
    try {
      // In a real app, this would update to the database
      console.log('Updating school info:', schoolInfo);
      alert('School information updated successfully!');
      setEditingSchool(false);
    } catch (error) {
      console.error('Error updating school info:', error);
    }
  };

  const handleAddUser = async () => {
    if (!userFormData.email || !userFormData.full_name || !userFormData.password) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const supabase = createClient();

      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userFormData.email,
        password: userFormData.password,
      });

      if (authError) throw authError;

      // Create user profile
      if (authData.user) {
        const newUser: User = {
          id: authData.user.id,
          email: userFormData.email,
          full_name: userFormData.full_name,
          role: userFormData.role,
          created_at: new Date().toISOString(),
        };

        setUsers([...users, newUser]);
        setAddUserDialogOpen(false);
        setUserFormData({
          email: '',
          full_name: '',
          password: '',
          role: 'teacher',
        });
        alert('User created successfully!');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Error creating user');
    }
  };

  const handleResetPassword = (userId: string) => {
    if (confirm('Send password reset email to this user?')) {
      console.log('Sending reset email for user:', userId);
      alert('Password reset email sent!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage school information and system settings</p>
      </div>

      {/* School Information Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">School Information</h2>
          <Button
            onClick={() => setEditingSchool(!editingSchool)}
            className={editingSchool ? 'bg-gray-600 hover:bg-gray-700' : 'bg-amber-600 hover:bg-amber-700'}
            variant={editingSchool ? 'default' : 'default'}
          >
            <Edit2 size={16} className="mr-2" />
            {editingSchool ? 'Done' : 'Edit'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
            <div className="space-y-4">
              <div>
                <Label className="text-amber-900 text-sm font-semibold">School Name</Label>
                {editingSchool ? (
                  <Input
                    value={schoolInfo.name}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, name: e.target.value })}
                    className="mt-2 border-amber-200"
                  />
                ) : (
                  <p className="mt-2 text-gray-900 font-semibold">{schoolInfo.name}</p>
                )}
              </div>

              <div>
                <Label className="text-amber-900 text-sm font-semibold">Principal</Label>
                {editingSchool ? (
                  <Input
                    value={schoolInfo.principal}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, principal: e.target.value })}
                    className="mt-2 border-amber-200"
                  />
                ) : (
                  <p className="mt-2 text-gray-900">{schoolInfo.principal}</p>
                )}
              </div>

              <div>
                <Label className="text-amber-900 text-sm font-semibold">Location</Label>
                {editingSchool ? (
                  <Input
                    value={schoolInfo.location}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, location: e.target.value })}
                    className="mt-2 border-amber-200"
                  />
                ) : (
                  <p className="mt-2 text-gray-900">{schoolInfo.location}</p>
                )}
              </div>

              <div>
                <Label className="text-amber-900 text-sm font-semibold">Phone</Label>
                {editingSchool ? (
                  <Input
                    value={schoolInfo.phone}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, phone: e.target.value })}
                    className="mt-2 border-amber-200"
                  />
                ) : (
                  <p className="mt-2 text-gray-900">{schoolInfo.phone}</p>
                )}
              </div>

              <div>
                <Label className="text-amber-900 text-sm font-semibold">Email</Label>
                {editingSchool ? (
                  <Input
                    type="email"
                    value={schoolInfo.email}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, email: e.target.value })}
                    className="mt-2 border-amber-200"
                  />
                ) : (
                  <p className="mt-2 text-gray-900">{schoolInfo.email}</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 border-amber-200 bg-gradient-to-br from-orange-50 to-amber-50">
            <div className="space-y-4">
              <div>
                <Label className="text-amber-900 text-sm font-semibold">Established Year</Label>
                {editingSchool ? (
                  <Input
                    value={schoolInfo.established}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, established: e.target.value })}
                    className="mt-2 border-amber-200"
                  />
                ) : (
                  <p className="mt-2 text-gray-900">{schoolInfo.established}</p>
                )}
              </div>

              <div>
                <Label className="text-amber-900 text-sm font-semibold">Board</Label>
                {editingSchool ? (
                  <Input
                    value={schoolInfo.board}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, board: e.target.value })}
                    className="mt-2 border-amber-200"
                  />
                ) : (
                  <p className="mt-2 text-gray-900">{schoolInfo.board}</p>
                )}
              </div>

              <div>
                <Label className="text-amber-900 text-sm font-semibold">Affiliation</Label>
                {editingSchool ? (
                  <Input
                    value={schoolInfo.affiliation}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, affiliation: e.target.value })}
                    className="mt-2 border-amber-200"
                  />
                ) : (
                  <p className="mt-2 text-gray-900">{schoolInfo.affiliation}</p>
                )}
              </div>

              <div className="pt-4 flex items-center justify-center">
                <div className="text-center p-4 bg-white rounded-lg border border-amber-200 w-full">
                  <p className="text-sm text-gray-600 mb-2">School Info Status</p>
                  <Badge className="bg-green-100 text-green-800">Complete</Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {editingSchool && (
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setEditingSchool(false)}
              className="border-amber-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSchoolInfo}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* User Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <Button
            onClick={() => setAddUserDialogOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
          >
            <Plus size={20} />
            Add User
          </Button>
        </div>

        <Card className="border-amber-200">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-amber-50">
                <TableRow className="border-b-2 border-amber-200">
                  <TableHead className="text-amber-900 font-semibold">Name</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Email</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Role</TableHead>
                  <TableHead className="text-amber-900 font-semibold">Created</TableHead>
                  <TableHead className="text-amber-900 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id} className="border-b border-amber-100 hover:bg-amber-50">
                    <TableCell className="font-semibold text-gray-900">
                      {user.full_name}
                    </TableCell>
                    <TableCell className="text-gray-700">{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'teacher'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResetPassword(user.id)}
                        className="text-amber-600 hover:bg-amber-100"
                      >
                        <RotateCcw size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* System Settings Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border-amber-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <h3 className="text-lg font-bold text-blue-900 mb-4">Database</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white rounded border border-blue-200">
                <span className="text-gray-700">Status</span>
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded border border-blue-200">
                <span className="text-gray-700">Backup Status</span>
                <Badge className="bg-green-100 text-green-800">Enabled</Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-amber-200 bg-gradient-to-br from-indigo-50 to-blue-50">
            <h3 className="text-lg font-bold text-indigo-900 mb-4">Authentication</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white rounded border border-indigo-200">
                <span className="text-gray-700">2FA</span>
                <Badge className="bg-yellow-100 text-yellow-800">Disabled</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded border border-indigo-200">
                <span className="text-gray-700">Session Timeout</span>
                <span className="font-semibold text-gray-900">30 minutes</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
        <DialogContent className="max-w-2xl border-amber-200">
          <DialogHeader>
            <DialogTitle className="text-amber-900">Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-amber-900">Full Name</Label>
              <Input
                placeholder="John Doe"
                value={userFormData.full_name}
                onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
                className="mt-2 border-amber-200"
              />
            </div>

            <div>
              <Label className="text-amber-900">Email</Label>
              <Input
                type="email"
                placeholder="user@gokul-buds.edu.in"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                className="mt-2 border-amber-200"
              />
            </div>

            <div>
              <Label className="text-amber-900">Password</Label>
              <Input
                type="password"
                placeholder="Set initial password"
                value={userFormData.password}
                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                className="mt-2 border-amber-200"
              />
            </div>

            <div>
              <Label className="text-amber-900">Role</Label>
              <div className="mt-2 grid grid-cols-3 gap-3">
                {['teacher', 'parent', 'admin'].map(role => (
                  <Button
                    key={role}
                    variant={userFormData.role === role ? 'default' : 'outline'}
                    onClick={() => setUserFormData({ ...userFormData, role: role as any })}
                    className={
                      userFormData.role === role
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'border-amber-200'
                    }
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAddUser}
                className="bg-amber-600 hover:bg-amber-700 text-white flex-1"
              >
                Create User
              </Button>
              <Button
                variant="outline"
                onClick={() => setAddUserDialogOpen(false)}
                className="flex-1 border-amber-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
