import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, StickyNote } from 'lucide-react';
import { Note } from '@/lib/types';
import { notesAPI, CreateNoteRequest } from '@/lib/api';
import PostItNote from './PostItNote';
import { useAlertActions } from '@/hooks/useAlert';

interface NotePosition {
  id: number;
  x: number;
  y: number;
}

const COLORS = [
  '#FFEB3B', // Yellow
  '#FF9800', // Orange  
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#9C27B0', // Purple
  '#F44336', // Red
  '#FF5722', // Deep Orange
  '#009688'  // Teal
];

const NotesBoard: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [notePositions, setNotePositions] = useState<NotePosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [expiryHours, setExpiryHours] = useState<number | null>(null);
  const { handleApiSuccess, handleApiError } = useAlertActions();
  const positionUpdateTimeouts = useRef<Map<number, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    loadNotes();
    
    // Cleanup timeouts on unmount
    return () => {
      positionUpdateTimeouts.current.forEach(timeout => clearTimeout(timeout));
      positionUpdateTimeouts.current.clear();
    };
  }, []);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const fetchedNotes = await notesAPI.getAll();
      setNotes(fetchedNotes);
      
      // Generate positions for new notes
      const positions = fetchedNotes.map((note, index) => ({
        id: note.id,
        x: note.positionX || (100 + (index % 4) * 220 + Math.random() * 50),
        y: note.positionY || (100 + Math.floor(index / 4) * 220 + Math.random() * 50)
      }));
      
      setNotePositions(positions);
    } catch (error) {
      handleApiError('load', 'ไม่สามารถโหลด notes ได้');
    } finally {
      setIsLoading(false);
    }
  };

  const createNote = async () => {
    if (!newNoteContent.trim()) return;

    try {
      const expiresAt = expiryHours ? new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString() : undefined;
      
      const newPosition = {
        x: 100 + Math.random() * 400,
        y: 100 + Math.random() * 300
      };

      const createRequest: CreateNoteRequest = {
        content: newNoteContent,
        color: selectedColor,
        expiresAt,
        positionX: newPosition.x,
        positionY: newPosition.y
      };

      const newNote = await notesAPI.create(createRequest);
      setNotes([...notes, newNote]);
      
      // Add position for new note
      const notePosition = {
        id: newNote.id,
        x: newPosition.x,
        y: newPosition.y
      };
      setNotePositions([...notePositions, notePosition]);

      // Reset form
      setNewNoteContent('');
      setSelectedColor(COLORS[0]);
      setExpiryHours(null);
      setShowCreateForm(false);
      
      handleApiSuccess('create', 'สร้าง note สำเร็จ');
    } catch (error) {
      handleApiError('create', 'ไม่สามารถสร้าง note ได้');
    }
  };

  const updateNote = async (id: number, content: string) => {
    try {
      const updatedNote = await notesAPI.update(id, { content });
      setNotes(notes.map(note => note.id === id ? updatedNote : note));
      handleApiSuccess('update', 'อัพเดต note สำเร็จ');
    } catch (error) {
      handleApiError('update', 'ไม่สามารถอัพเดต note ได้');
    }
  };

  const deleteNote = async (id: number) => {
    try {
      await notesAPI.delete(id);
      setNotes(notes.filter(note => note.id !== id));
      setNotePositions(notePositions.filter(pos => pos.id !== id));
      handleApiSuccess('delete', 'ลบ note สำเร็จ');
    } catch (error) {
      handleApiError('delete', 'ไม่สามารถลบ note ได้');
    }
  };

  const updatePosition = useCallback((id: number, position: { x: number; y: number }) => {
    // Update position immediately for smooth dragging
    setNotePositions(positions => 
      positions.map(pos => pos.id === id ? { ...pos, ...position } : pos)
    );
    
    // Debounce backend update to avoid too many API calls
    const existingTimeout = positionUpdateTimeouts.current.get(id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    const newTimeout = setTimeout(async () => {
      try {
        await notesAPI.update(id, { positionX: position.x, positionY: position.y });
        positionUpdateTimeouts.current.delete(id);
      } catch (error) {
        console.error('Failed to update note position:', error);
      }
    }, 500); // Wait 500ms after user stops dragging
    
    positionUpdateTimeouts.current.set(id, newTimeout);
  }, []);

  const getPosition = (id: number) => {
    const position = notePositions.find(pos => pos.id === id);
    return position || { x: 100, y: 100 };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[600px] overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg">
      {/* Create Note Button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded-lg shadow-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      {/* Empty State */}
      {notes.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <StickyNote className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-lg mb-2">No notes yet</p>
          <p className="text-sm">Click "New Note" to create your first sticky note</p>
        </div>
      )}

      {/* Notes */}
      {notes.map(note => (
        <PostItNote
          key={note.id}
          note={note}
          onUpdate={updateNote}
          onDelete={deleteNote}
          position={getPosition(note.id)}
          onPositionChange={updatePosition}
        />
      ))}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-96 max-w-[90vw] shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create New Note</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-800 dark:text-gray-200">Content</label>
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full h-32 p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white text-gray-900 placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                  placeholder="Write your note here..."
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-3 text-gray-800 dark:text-gray-200">Color</label>
                <div className="flex gap-3 flex-wrap">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-3 shadow-md hover:scale-105 transition-all ${
                        selectedColor === color 
                          ? 'border-gray-800 dark:border-white ring-2 ring-gray-600 dark:ring-gray-300' 
                          : 'border-gray-400 dark:border-gray-500 hover:border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-3 text-gray-800 dark:text-gray-200">Auto-delete after (hours)</label>
                <input
                  type="number"
                  value={expiryHours || ''}
                  onChange={(e) => setExpiryHours(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-white text-gray-900 placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                  placeholder="Leave empty for no expiry"
                  min="1"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-7">
              <button
                onClick={createNote}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-gray-900 font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Create Note
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewNoteContent('');
                  setSelectedColor(COLORS[0]);
                  setExpiryHours(null);
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesBoard;