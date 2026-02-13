import { useState, useRef, useEffect } from 'react';
import ColorPalette from './ColorPalette';

export default function GroupCreator({
    onCreateGroup,
    onCancel,
    initialName = '',
    initialColor = 'blue',
    mode = 'create',
    position = null // { top, left } for fixed positioning
}) {
    const [groupName, setGroupName] = useState(initialName);
    const [selectedColor, setSelectedColor] = useState(initialColor);
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                handleSubmit();
            }
        }
        // Small delay to prevent immediate close
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 100);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [groupName, selectedColor]);

    // Close on escape
    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                onCancel();
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onCancel]);

    const handleSubmit = () => {
        const name = groupName.trim() || 'Unnamed Group';
        onCreateGroup(name, selectedColor);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        } else if (e.key === 'Escape') {
            onCancel();
        }
    };

    // Calculate position with boundary checks
    const getPositionStyle = () => {
        if (!position) return {};

        // Ensure popup stays within viewport
        const popupWidth = 220;
        const popupHeight = 160;

        let left = position.left;
        let top = position.top;

        // Check right boundary
        if (left + popupWidth > window.innerWidth - 20) {
            left = window.innerWidth - popupWidth - 20;
        }

        // Check left boundary
        if (left < 20) {
            left = 20;
        }

        // Check bottom boundary
        if (top + popupHeight > window.innerHeight - 20) {
            top = position.top - popupHeight - 10; // Show above instead
        }

        return {
            position: 'fixed',
            top: `${top}px`,
            left: `${left}px`,
            zIndex: 1000
        };
    };

    return (
        <div
            ref={containerRef}
            className="animate-fadeIn"
            style={getPositionStyle()}
        >
            <div className="bg-[#1a1a1e] border border-[#222225] rounded-lg shadow-2xl p-3 min-w-[200px]">
                {/* Arrow pointer */}
                <div
                    className="absolute -top-2 left-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-[#222225]"
                    style={{ filter: 'drop-shadow(0 -1px 1px rgba(0,0,0,0.3))' }}
                />
                <div
                    className="absolute -top-[6px] left-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-[#1a1a1e]"
                />

                <div className="text-xs text-[#7a7a80] mb-2 font-medium">
                    {mode === 'create' ? 'Name this group' : 'Edit group'}
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter group name"
                    className="w-full px-3 py-2 bg-[#141416] border border-[#222225] rounded-lg text-[#ededef] text-sm placeholder-[#4e4e56] focus:outline-none focus:border-[#6e7bf2] mb-3"
                />

                <div className="text-xs text-[#4e4e56] mb-2">Select color:</div>
                <ColorPalette
                    selectedColor={selectedColor}
                    onColorSelect={setSelectedColor}
                    size="md"
                />

                <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-[#222225]">
                    <button
                        onClick={onCancel}
                        className="px-3 py-1.5 text-xs text-[#7a7a80] hover:text-[#ededef] hover:bg-[#222225] rounded transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-3 py-1.5 text-xs bg-[#6e7bf2] hover:bg-[#8b96f7] text-[#141416] font-medium rounded transition-colors"
                    >
                        {mode === 'create' ? 'Create' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}
