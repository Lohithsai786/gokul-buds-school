'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { ClassGroupChat } from '@/components/shared/class-group-chat';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface GroupRow {
  id: string;
  name: string;
  class_id: string;
  classes: { name: string; section: string } | null;
}

export default function TeacherGroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    const fetchGroups = async () => {
      setLoading(true);
      setError('');
      try {
        // Find the teacher record for this user, then their class assignments.
        const { data: teacher } = await supabase
          .from('teachers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!teacher) {
          setError('No teacher profile found for your account. Please contact the administrator.');
          setLoading(false);
          return;
        }

        const teacherId = teacher.id;

        // Get class_ids this teacher is assigned to.
        const { data: assignments } = await supabase
          .from('class_teachers')
          .select('class_id')
          .eq('teacher_id', teacherId);

        const classIds = (assignments ?? []).map((a: any) => a.class_id).filter(Boolean);
        if (classIds.length === 0) {
          setError('You have not been assigned to any class yet. Please contact the administrator.');
          setLoading(false);
          return;
        }

        // Fetch class groups for these classes.
        const { data: groupData, error: groupError } = await supabase
          .from('chat_groups')
          .select('id, name, class_id, classes(name, section)')
          .in('class_id', classIds)
          .order('name');

        if (groupError) {
          setError(groupError.message);
        } else {
          setGroups((groupData ?? []) as unknown as GroupRow[]);
          if (groupData && groupData.length > 0) setSelectedGroupId(groupData[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load groups');
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [user, supabase]);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);
  const displayName = selectedGroup
    ? selectedGroup.classes
      ? `${selectedGroup.classes.name} - ${selectedGroup.classes.section} Group`
      : selectedGroup.name
    : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Class Group</h1>
        <p className="text-gray-600 mt-1">Post messages, photos, and files to your class parents</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {groups.length > 1 && (
        <Card className="p-4 border-amber-200">
          <Label className="text-amber-900">Select Group</Label>
          <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
            <SelectTrigger className="mt-2 border-amber-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {groups.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.classes ? `${g.classes.name} - ${g.classes.section} Group` : g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>
      )}

      {selectedGroupId && (
        <ClassGroupChat
          groupId={selectedGroupId}
          groupName={displayName}
          canPost
          viewerRole="teacher"
        />
      )}
    </div>
  );
}
