import { useState, useCallback } from 'react';
import { Character } from '@/types';
import { SingleGrid } from './SingleGrid';
import { useProgressStore } from '@/store/useProgressStore';

interface MiZiGeCanvasProps {
  character: Character;
}

const GRID_COUNT = 9;

export function MiZiGeCanvas({ character }: MiZiGeCanvasProps) {
  const [activeGrid, setActiveGrid] = useState(0);
  const [scoredGrids, setScoredGrids] = useState<Set<number>>(new Set());
  const recordScore = useProgressStore((s) => s.recordScore);

  const handleScoreComputed = useCallback(
    (gridIndex: number, score: number) => {
      if (!scoredGrids.has(gridIndex)) {
        setScoredGrids((prev) => new Set(prev).add(gridIndex));
        if (score >= 50) {
          recordScore(character.id, score);
        }
      }
    },
    [character.id, recordScore, scoredGrids]
  );

  return (
    <div
      key={character.id}
      className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-yellow-50/80 border-2 border-amber-200/60 shadow-inner"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-16 h-16 rounded-xl bg-white shadow-lg flex items-center justify-center border-2 border-red-200"
            style={{
              fontFamily:
                character.type === 'chinese'
                  ? '"KaiTi", "STKaiti", "楷体", serif'
                  : '"Dancing Script", "Great Vibes", cursive',
              fontSize: character.type === 'chinese' ? 42 : 38,
              fontWeight: 'bold',
              color: '#C53D43',
            }}
          >
            {character.char}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800" style={{ fontFamily: '"KaiTi", "STKaiti", serif' }}>
              描摹练习
            </h3>
            {character.pinyin && (
              <p className="text-sm text-gray-500">
                <span className="text-red-500 font-medium">{character.pinyin}</span>
                {character.meaning && ` · ${character.meaning}`}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">
              难度：{'★'.repeat(character.difficulty)}
              {'☆'.repeat(3 - character.difficulty)}
              {character.strokes && ` · ${character.strokes}画`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">已完成</p>
          <p className="text-2xl font-bold text-red-500" style={{ fontFamily: '"KaiTi", serif' }}>
            {scoredGrids.size}
            <span className="text-sm text-gray-400 font-normal">/{GRID_COUNT}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: GRID_COUNT }).map((_, index) => (
          <SingleGrid
            key={`${character.id}-${index}`}
            character={character}
            gridIndex={index}
            isActive={activeGrid === index}
            onClick={() => setActiveGrid(index)}
            onScoreComputed={(score) => handleScoreComputed(index, score)}
          />
        ))}
      </div>

      <div className="mt-4 text-center text-xs text-gray-400">
        💡 提示：用鼠标或手指沿着灰色范字描摹，描完一个字会自动评分
      </div>
    </div>
  );
}
