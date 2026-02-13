import { ChevronRight, FolderPlus, Unlink, X, XCircle } from 'lucide-react';
import { getColorValue } from './ColorPalette';

export default function TabContextMenu({
    position,
    tab,
    tabGroups = [], // Ensure it's always an array
    onClose,
    onAddToNewGroup,
    onAddToGroup,
    onRemoveFromGroup,
    onCloseTab,
    onCloseOtherTabs
}) {
    if (!position || !tab) return null;

    const isInGroup = tab?.groupId != null;

    // Filter out any invalid groups (extra safety)
    const validGroups = Array.isArray(tabGroups) ? tabGroups.filter(g => g && g.id && g.name) : [];

    // Check if there are groups to show (excluding current tab's group if it's already in one)
    const availableGroups = validGroups.filter(g => g.id !== tab.groupId);
    const hasAvailableGroups = availableGroups.length > 0;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Menu */}
            <div
                className="fixed z-50 bg-[#1a1a1e] border border-[#222225] rounded-lg shadow-2xl py-1 min-w-[200px] animate-fadeIn"
                style={{
                    top: Math.min(position.y, window.innerHeight - 250),
                    left: Math.min(position.x, window.innerWidth - 220)
                }}
            >
                {/* Add to new group */}
                <button
                    onClick={() => { onAddToNewGroup(tab.id); onClose(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#ededef] hover:bg-[#222225] transition-colors text-left"
                >
                    <FolderPlus className="w-4 h-4 text-[#6e7bf2]" />
                    Add to new group
                </button>

                {/* Add to existing group - ONLY show if there are valid groups */}
                {hasAvailableGroups && (
                    <div className="relative group/submenu">
                        <button
                            className="w-full flex items-center justify-between px-3 py-2 text-sm text-[#ededef] hover:bg-[#222225] transition-colors text-left"
                        >
                            <span className="flex items-center gap-2">
                                <FolderPlus className="w-4 h-4 text-[#7a7a80]" />
                                Add to existing group
                            </span>
                            <ChevronRight className="w-4 h-4 text-[#4e4e56]" />
                        </button>

                        {/* Submenu */}
                        <div className="absolute left-full top-0 ml-1 hidden group-hover/submenu:block bg-[#1a1a1e] border border-[#222225] rounded-lg shadow-xl py-1 min-w-[150px]">
                            {availableGroups.map(group => (
                                <button
                                    key={group.id}
                                    onClick={() => { onAddToGroup(tab.id, group.id); onClose(); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#ededef] hover:bg-[#222225] transition-colors text-left"
                                >
                                    <span
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: getColorValue(group.color) }}
                                    />
                                    <span className="truncate">{group.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Remove from group */}
                {isInGroup && (
                    <button
                        onClick={() => { onRemoveFromGroup(tab.id); onClose(); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#ededef] hover:bg-[#222225] transition-colors text-left"
                    >
                        <Unlink className="w-4 h-4 text-[#7a7a80]" />
                        Remove from group
                    </button>
                )}

                <div className="border-t border-[#222225] my-1" />

                {/* Close tab */}
                <button
                    onClick={() => { onCloseTab(tab.id); onClose(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#ededef] hover:bg-[#222225] transition-colors text-left"
                >
                    <X className="w-4 h-4 text-[#7a7a80]" />
                    Close tab
                </button>

                {/* Close other tabs */}
                <button
                    onClick={() => { onCloseOtherTabs(tab.id); onClose(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#e5484d] hover:bg-[#e5484d]/10 transition-colors text-left"
                >
                    <XCircle className="w-4 h-4" />
                    Close other tabs
                </button>
            </div>
        </>
    );
}
