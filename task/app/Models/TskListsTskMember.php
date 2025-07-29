<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TskListsTskMember extends Model
{
    use SoftDeletes;
     protected $fillable = [
         'tsk_list_id',
         'tsk_member_id',
     ];
     public function tsk_list(): BelongsTo
     {
         return $this->belongsTo(TskList::class,'tsk_list_id');
     }
      public function tsk_member(): BelongsTo
      {
          return $this->belongsTo(TskMember::class,'tsk_member_id');
      }
}
