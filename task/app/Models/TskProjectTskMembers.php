<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TskProjectTskMembers extends Model
{
    use SoftDeletes;

    protected $table = 'tsk_projects_tsk_members';
    protected $fillable = [
        'tsk_project_id',
        'tsk_member_id',
        'is_owner',
        'is_controller'
    ];

    public function tsk_project(): BelongsTo
    {
        return $this->belongsTo(TskProject::class, 'tsk_project_id');
    }
     public function tsk_member(): BelongsTo
     {
        return $this->belongsTo(TskMember::class, 'tsk_member_id');
     }
}
