'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
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

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const fetchGroups = async () => {
      const { data, error: fetchError } = await supabase
        .from('chat_groups')
        .select('id, name, class_id, classes(name, section)')
        .order('name');
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setGroups((data ?? []) as unknown as GroupRow[]);
        if (data && data.length > 0) setSelectedGroupId(data[0].id);
      }
      setLoading(false);
    };
    fetchGroups();
  }, [supabase]);

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
        <h1 className="text-4xl font-bold text-gray-900">Class Groups</h1>
        <p className="text-gray-600 mt-1">Monitor communication across all class groups</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      <Card className="p-4 border-amber-200">
        <Label className="text-amber-900">Select Group</Label>
        <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
          <SelectTrigger className="mt-2 border-amber-200">
            <SelectValue placeholder="Choose a group to monitor" />
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

      {selectedGroupId && (
        <ClassGroupChat
          groupId={selectedGroupId}
          groupName={displayName}
          canPost
          viewerRole="admin"
        />
      )}
    </div>
  );
}
