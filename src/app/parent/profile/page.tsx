'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared';
import { User, Phone, MapPin, Edit2, Check, X } from 'lucide-react';

interface Student {
  id: string;
  admission_number: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  class_id: string;
  admission_date: string;
  status: string;
  avatar_url?: string;
  class?: { id: string; name: string; section: string };
}

interface Parent {
  id: string;
  user_id: string;
  student_id: string;
  father_name: string;
  mother_name: string;
  phone: string;
  alternate_phone?: string;
  address: string;
  relation: string;
}

export default function ProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [parent, setParent] = useState<Parent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({
    fatherName: '',
    motherName: '',
    phone: '',
    alternatePhone: '',
    address: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Get parent's student
        const { data: parentData } = await supabase
          .from('parents')
          .select('*')
          .limit(1)
          .single();

        if (parentData) {
          setParent(parentData);

          // Get student info
          const { data: studentData } = await supabase
            .from('students')
            .select(
              `
              id,
              admission_number,
              full_name,
              date_of_birth,
              gender,
              class_id,
              admission_date,
              status,
              avatar_url,
              classes:class_id(id, name, section)
            `
            )
            .eq('id', parentData.student_id)
            .single();

          if (studentData) {
            setStudent(studentData);
          }

          // Set form data
          setFormData({
            fatherName: parentData.father_name || '',
            motherName: parentData.mother_name || '',
            phone: parentData.phone || '',
            alternatePhone: parentData.alternate_phone || '',
            address: parentData.address || '',
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase]);

  const handleSaveChanges = async () => {
    if (!parent) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('parents')
        .update({
          father_name: formData.fatherName,
          mother_name: formData.motherName,
          phone: formData.phone,
          alternate_phone: formData.alternatePhone,
          address: formData.address,
        })
        .eq('id', parent.id);

      if (error) throw error;

      // Update local state
      setParent({
        ...parent,
        father_name: formData.fatherName,
        mother_name: formData.motherName,
        phone: formData.phone,
        alternate_phone: formData.alternatePhone,
        address: formData.address,
      });

      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (parent) {
      setFormData({
        fatherName: parent.father_name || '',
        motherName: parent.mother_name || '',
        phone: parent.phone || '',
        alternatePhone: parent.alternate_phone || '',
        address: parent.address || '',
      });
    }
    setIsEditing(false);
  };

  const getGenderBadge = (gender: string) => {
    if (gender.toLowerCase() === 'male') {
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Boy</Badge>;
    }
    if (gender.toLowerCase() === 'female') {
      return <Badge className="bg-pink-100 text-pink-700 border-pink-200">Girl</Badge>;
    }
    return <Badge variant="outline">{gender}</Badge>;
  };

  const getStudentInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!student || !parent) {
    return (
      <EmptyState
        icon={<User className="w-8 h-8" />}
        title="No Profile Data"
        description="No profile information available. Please contact administration."
      />
    );
  }

  const cls = Array.isArray(student.class) ? student.class[0] : student.class;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">My Profile</h1>
          <p className="text-gray-600">View and manage your account information</p>
        </div>

        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Student Information */}
      <Card className="p-6 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Information</h2>

        <div className="flex items-start gap-6 mb-6">
          <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {getStudentInitials(student.full_name)}
          </div>

          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {student.full_name}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">
                  Admission Number
                </p>
                <p className="text-lg font-bold text-amber-700">
                  {student.admission_number}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Class</p>
                <p className="text-lg font-bold text-amber-700">
                  {cls?.name} {cls?.section && `- ${cls.section}`}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Gender</p>
                <div className="mt-1">{getGenderBadge(student.gender)}</div>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">
                  Date of Birth
                </p>
                <p className="text-lg font-bold text-amber-700">
                  {new Date(student.date_of_birth).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">
                  Admission Date
                </p>
                <p className="text-lg font-bold text-amber-700">
                  {new Date(student.admission_date).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Status</p>
                <Badge className="bg-green-100 text-green-700 border-green-200 capitalize">
                  {student.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Parent Information */}
      <Card className="p-6 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Parent Information</h2>
          {isEditing && (
            <div className="flex gap-2">
              <Button
                onClick={handleSaveChanges}
                disabled={saving}
                className="gap-2 bg-green-500 hover:bg-green-600 text-white"
              >
                <Check className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="gap-2 border-gray-300"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Father's Name */}
          <div>
            <Label
              htmlFor="father-name"
              className="text-sm font-semibold text-gray-700 mb-2 block"
            >
              Father's Name
            </Label>
            {isEditing ? (
              <Input
                id="father-name"
                value={formData.fatherName}
                onChange={(e) =>
                  setFormData({ ...formData, fatherName: e.target.value })
                }
                className="border-blue-300"
              />
            ) : (
              <p className="text-lg font-semibold text-gray-900">
                {parent.father_name || '-'}
              </p>
            )}
          </div>

          {/* Mother's Name */}
          <div>
            <Label
              htmlFor="mother-name"
              className="text-sm font-semibold text-gray-700 mb-2 block"
            >
              Mother's Name
            </Label>
            {isEditing ? (
              <Input
                id="mother-name"
                value={formData.motherName}
                onChange={(e) =>
                  setFormData({ ...formData, motherName: e.target.value })
                }
                className="border-blue-300"
              />
            ) : (
              <p className="text-lg font-semibold text-gray-900">
                {parent.mother_name || '-'}
              </p>
            )}
          </div>

          {/* Primary Phone */}
          <div>
            <Label
              htmlFor="phone"
              className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Primary Phone
            </Label>
            {isEditing ? (
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="border-blue-300"
              />
            ) : (
              <p className="text-lg font-semibold text-gray-900">
                {parent.phone || '-'}
              </p>
            )}
          </div>

          {/* Alternate Phone */}
          <div>
            <Label
              htmlFor="alternate-phone"
              className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Alternate Phone
            </Label>
            {isEditing ? (
              <Input
                id="alternate-phone"
                type="tel"
                value={formData.alternatePhone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    alternatePhone: e.target.value,
                  })
                }
                className="border-blue-300"
              />
            ) : (
              <p className="text-lg font-semibold text-gray-900">
                {parent.alternate_phone || '-'}
              </p>
            )}
          </div>

          {/* Address - Full Width */}
          <div className="md:col-span-2">
            <Label
              htmlFor="address"
              className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Address
            </Label>
            {isEditing ? (
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="border-blue-300"
                rows={3}
              />
            ) : (
              <p className="text-lg font-semibold text-gray-900 whitespace-pre-wrap">
                {parent.address || '-'}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Important Notes */}
      <Card className="p-6 border-orange-200 bg-orange-50">
        <h3 className="font-bold text-orange-900 mb-3">Important Notes</h3>
        <ul className="space-y-2 text-sm text-orange-800">
          <li className="flex gap-2">
            <span className="text-orange-600">•</span>
            <span>Keep your contact information up to date for school communications</span>
          </li>
          <li className="flex gap-2">
            <span className="text-orange-600">•</span>
            <span>Provide at least one valid phone number for emergency contact</span>
          </li>
          <li className="flex gap-2">
            <span className="text-orange-600">•</span>
            <span>
              Update your address if you move or change residence
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-orange-600">•</span>
            <span>
              Any changes to student information must be approved by administration
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
