import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { mockEquipment, mockHissatsu, calculateStats } from '../data/mock';
import { toast } from 'sonner';

const CharacterModal = ({ character, isOpen, onClose, allCharacters }) => {
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(
    allCharacters.findIndex(c => c.id === character.id)
  );
  const [userLevel, setUserLevel] = useState(character.baseLevel);
  const [userRarity, setUserRarity] = useState(character.baseRarity);
  const [selectedEquipment, setSelectedEquipment] = useState({
    boots: null,
    bracelet: null,
    pendant: null,
    special: null
  });
  const [selectedHissatsu, setSelectedHissatsu] = useState(character.hissatsu || []);
  const [showEquipmentList, setShowEquipmentList] = useState(false);
  const [showHissatsuList, setShowHissatsuList] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hissatsuSlotIndex, setHissatsuSlotIndex] = useState(null);

  const currentCharacter = allCharacters[currentCharacterIndex];
  const calculatedStats = calculateStats(currentCharacter, selectedEquipment, userLevel, userRarity);

  const getPositionColor = (position) => {
    switch (position) {
      case 'FW': return 'bg-red-500 text-white';
      case 'MF': return 'bg-orange-500 text-white';
      case 'DF': return 'bg-sky-400 text-white';
      case 'GK': return 'bg-white text-black';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatColor = (position) => {
    switch (position) {
      case 'FW': return 'text-red-400';
      case 'MF': return 'text-orange-400';
      case 'DF': return 'text-sky-400';
      case 'GK': return 'text-white';
      default: return 'text-gray-400';
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'Epic': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'Rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'Common': return 'bg-gradient-to-r from-gray-400 to-gray-600';
      default: return 'bg-gray-500';
    }
  };

  const navigateCharacter = (direction) => {
    const newIndex = direction === 'next' 
      ? (currentCharacterIndex + 1) % allCharacters.length
      : (currentCharacterIndex - 1 + allCharacters.length) % allCharacters.length;
    
    setCurrentCharacterIndex(newIndex);
    // Reset user preferences for new character
    setUserLevel(99);
    setUserRarity('Legendary');
    setSelectedEquipment({
      boots: null,
      bracelet: null,
      pendant: null,
      special: null
    });
  };

  const handleEquipmentSelect = (equipment) => {
    setSelectedEquipment(prev => ({
      ...prev,
      [selectedCategory]: equipment
    }));
    setShowEquipmentList(false);
    setSelectedCategory(null);
    toast.success(`${equipment.name} equipped!`);
  };

  const handleHissatsuSelect = (hissatsu) => {
    if (hissatsuSlotIndex !== null) {
      const newHissatsu = [...selectedHissatsu];
      newHissatsu[hissatsuSlotIndex] = hissatsu;
      setSelectedHissatsu(newHissatsu);
      setShowHissatsuList(false);
      setHissatsuSlotIndex(null);
    }
  };

  const handleRemoveHissatsu = (index) => {
    const newHissatsu = [...selectedHissatsu];
    newHissatsu.splice(index, 1);
    setSelectedHissatsu(newHissatsu);
  };

  const handleAddHissatsu = () => {
    if (selectedHissatsu.length < 4) {
      setHissatsuSlotIndex(selectedHissatsu.length);
      setShowHissatsuList(true);
    }
  };

  const handleChangeHissatsu = (index) => {
    setHissatsuSlotIndex(index);
    setShowHissatsuList(true);
  };

  const addToTeam = () => {
    toast.success(`${currentCharacter.name} (Lv.${userLevel}) added to team!`);
  };

  const StatRadarChart = ({ stats }) => {
    const statNames = ['kick', 'control', 'technique', 'intelligence', 'pressure', 'agility', 'physical'];
    const maxValue = 300;
    const center = 60;
    const radius = 50;
    
    const points = statNames.map((stat, index) => {
      const angle = (index * 2 * Math.PI) / statNames.length - Math.PI / 2;
      const value = stats[stat].main;
      const r = (value / maxValue) * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return { x, y, value, stat };
    });

    const pathData = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ') + ' Z';

    return (
      <div className="relative">
        <svg width="120" height="120" className="mx-auto">
          {/* Background circles */}
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((ratio, index) => (
            <circle
              key={index}
              cx={center}
              cy={center}
              r={radius * ratio}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          ))}
          
          {/* Stat lines */}
          {statNames.map((stat, index) => {
            const angle = (index * 2 * Math.PI) / statNames.length - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return (
              <line
                key={stat}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            );
          })}
          
          {/* Stat area */}
          <path
            d={pathData}
            fill={`rgba(59, 130, 246, 0.3)`}
            stroke="rgb(59, 130, 246)"
            strokeWidth="2"
          />
          
          {/* Stat points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="rgb(59, 130, 246)"
            />
          ))}
        </svg>
      </div>
    );
  };

  if (!currentCharacter) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gradient-to-br from-cyan-900 via-teal-800 to-blue-900 text-white border-cyan-400/20 overflow-y-auto">
        <DialogHeader className="relative">
          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-0 top-0 text-white hover:bg-cyan-700/30"
            onClick={() => navigateCharacter('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 text-white hover:bg-cyan-700/30"
            onClick={() => navigateCharacter('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Character Header */}
          <div className={`${userRarity === 'Legendary' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-cyan-500 to-teal-600'} rounded-lg p-4 mt-8`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{currentCharacter.title}</h2>
                <h3 className="text-xl">{currentCharacter.name}</h3>
                <p className="text-lg">{currentCharacter.nickname}</p>
              </div>
              <div className="text-right">
                <Badge className={`${getPositionColor(currentCharacter.position)} text-lg px-3 py-1 mb-2`}>
                  {currentCharacter.position}
                </Badge>
                <div className="text-2xl font-bold">#{currentCharacter.jerseyNumber}</div>
                <div className="text-lg">Lv. {userLevel}</div>
                <Badge className={`${getRarityColor(userRarity)} mt-1`}>
                  {userRarity}
                </Badge>
              </div>
            </div>
          </div>

          {/* User Controls */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Level (1-99)</label>
              <Select value={userLevel.toString()} onValueChange={(value) => setUserLevel(parseInt(value))}>
                <SelectTrigger className="bg-cyan-900/30 border-cyan-400/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-cyan-900 border-cyan-400/30">
                  {Array.from({ length: 99 }, (_, i) => i + 1).map(level => (
                    <SelectItem key={level} value={level.toString()} className="text-white hover:bg-cyan-800">
                      Level {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Rarity</label>
              <Select value={userRarity} onValueChange={setUserRarity}>
                <SelectTrigger className="bg-cyan-900/30 border-cyan-400/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-cyan-900 border-cyan-400/30">
                  <SelectItem value="Common" className="text-white hover:bg-cyan-800">Common</SelectItem>
                  <SelectItem value="Rare" className="text-white hover:bg-cyan-800">Rare</SelectItem>
                  <SelectItem value="Epic" className="text-white hover:bg-cyan-800">Epic</SelectItem>
                  <SelectItem value="Legendary" className="text-white hover:bg-cyan-800">Legendary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="bg-cyan-100 text-cyan-800 p-3 rounded-lg mt-4 border-l-4 border-cyan-500">
            <p className="italic">{currentCharacter.description}</p>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Stats Panel */}
          <Card className="bg-black/30 backdrop-blur-lg border-cyan-400/20">
            <CardContent className="p-4">
              <h4 className="text-lg font-bold mb-4 text-center">PARAMETERS</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <StatRadarChart stats={calculatedStats} />
                </div>
                <div className="space-y-2">
                  {Object.entries(calculatedStats).map(([stat, values]) => (
                    <div key={stat} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{stat}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getStatColor(currentCharacter.position)}`}>
                          {values.main}
                        </span>
                        <span className="text-sm text-gray-400">
                          {values.secondary}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Panel */}
          <Card className="bg-black/30 backdrop-blur-lg border-cyan-400/20">
            <CardContent className="p-4">
              <h4 className="text-lg font-bold mb-4">EQUIPMENT</h4>
              
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(selectedEquipment).map(([category, item]) => (
                  <div
                    key={category}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      item ? getRarityColor(item.rarity) : 'border-dashed border-cyan-400/30 bg-cyan-900/20'
                    } hover:scale-105`}
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowEquipmentList(true);
                    }}
                  >
                    {item ? (
                      <div className="flex items-center gap-2">
                        <img src={item.icon} alt={item.name} className="w-8 h-8" />
                        <div>
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-gray-200">{item.category}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Plus className="h-6 w-6 mx-auto mb-1 text-cyan-400" />
                        <div className="text-xs text-cyan-400 capitalize">{category}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Passives */}
          <Card className="bg-black/30 backdrop-blur-lg border-cyan-400/20">
            <CardContent className="p-4">
              <h4 className="text-lg font-bold mb-4">TEAM PASSIVES</h4>
              
              <div className="space-y-3">
                {currentCharacter.teamPassives.map((passive, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <img src={passive.icon} alt={passive.name} className="w-6 h-6 mt-1" />
                    <div>
                      <div className="font-medium text-sm">{passive.name}</div>
                      <div className="text-xs text-gray-300">{passive.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hissatsu Panel */}
          <Card className="bg-black/30 backdrop-blur-lg border-cyan-400/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold">HISSATSU (TECHNIQUES)</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddHissatsu}
                  disabled={selectedHissatsu.length >= 4}
                  className="text-white border-cyan-400/30 hover:bg-cyan-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              
              <div className="space-y-3">
                {selectedHissatsu.map((technique, index) => (
                  <div
                    key={index}
                    className="p-3 bg-cyan-600/20 rounded-lg border border-cyan-500/30 group relative"
                  >
                    <div className="flex items-center gap-3">
                      <img src={technique.icon} alt={technique.name} className="w-8 h-8" />
                      <div>
                        <div className="font-medium">{technique.name}</div>
                        <div className="text-sm text-gray-300">{technique.description}</div>
                        <Badge variant="outline" className="mt-1 text-cyan-400 border-cyan-400">
                          {technique.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleChangeHissatsu(index)}
                        className="h-6 w-6 p-0 hover:bg-cyan-700"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveHissatsu(index)}
                        className="h-6 w-6 p-0 hover:bg-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {selectedHissatsu.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>No hissatsu techniques selected</p>
                    <p className="text-sm">Click "Add" to select techniques</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add to Team Button */}
        <div className="flex justify-center mt-6">
          <Button
            onClick={addToTeam}
            className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-8 py-3 text-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add to Team
          </Button>
        </div>

        {/* Equipment List Modal */}
        {showEquipmentList && selectedCategory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-cyan-900 p-6 rounded-lg max-w-md w-full mx-4 max-h-96 overflow-y-auto border border-cyan-400/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Select {selectedCategory}</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowEquipmentList(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {mockEquipment[selectedCategory]?.map((equipment) => (
                  <div
                    key={equipment.id}
                    className={`p-3 rounded-lg cursor-pointer hover:scale-105 transition-all ${getRarityColor(equipment.rarity)}`}
                    onClick={() => handleEquipmentSelect(equipment)}
                  >
                    <div className="flex items-center gap-2">
                      <img src={equipment.icon} alt={equipment.name} className="w-8 h-8" />
                      <div>
                        <div className="font-medium">{equipment.name}</div>
                        <div className="text-sm text-gray-200">{equipment.category}</div>
                        <div className="text-xs text-cyan-400">
                          {Object.entries(equipment.stats).map(([stat, value]) => 
                            `${stat}: +${value}`
                          ).join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Hissatsu Selection Modal */}
        {showHissatsuList && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-cyan-900 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto border border-cyan-400/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Select Hissatsu Technique</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowHissatsuList(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {mockHissatsu.map((hissatsu) => (
                  <div
                    key={hissatsu.id}
                    className="p-3 rounded-lg cursor-pointer hover:scale-105 transition-all bg-cyan-800/30 border border-cyan-400/30 hover:bg-cyan-700/30"
                    onClick={() => handleHissatsuSelect(hissatsu)}
                  >
                    <div className="flex items-center gap-2">
                      <img src={hissatsu.icon} alt={hissatsu.name} className="w-8 h-8" />
                      <div>
                        <div className="font-medium">{hissatsu.name}</div>
                        <div className="text-sm text-gray-200">{hissatsu.description}</div>
                        <Badge variant="outline" className="mt-1 text-cyan-400 border-cyan-400">
                          {hissatsu.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CharacterModal;