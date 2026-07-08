import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import React, { useRef, useState } from 'react';
import { useIntl, defineMessages } from 'react-intl';

import { apiClient } from '../../../store/apiClient';

const localMessages = defineMessages({
  title: {
    id: 'komunicare.components.CreateCommunicatorModal.title',
    defaultMessage: 'Create Communicator',
  },
  nameLabel: {
    id: 'komunicare.components.CreateCommunicatorModal.nameLabel',
    defaultMessage: 'Name',
  },
  namePlaceholder: {
    id: 'komunicare.components.CreateCommunicatorModal.namePlaceholder',
    defaultMessage: 'My communicator',
  },
  descriptionLabel: {
    id: 'komunicare.components.CreateCommunicatorModal.descriptionLabel',
    defaultMessage: 'Description (optional)',
  },
  cancel: {
    id: 'komunicare.components.CreateCommunicatorModal.cancel',
    defaultMessage: 'Cancel',
  },
  create: {
    id: 'komunicare.components.CreateCommunicatorModal.create',
    defaultMessage: 'Create',
  },
  creating: {
    id: 'komunicare.components.CreateCommunicatorModal.creating',
    defaultMessage: 'Creating…',
  },
  addImage: {
    id: 'komunicare.components.CreateCommunicatorModal.addImage',
    defaultMessage: 'Add image',
  },
});

interface CreateCommunicatorModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (communicatorId: string) => void;
  createRemoteCommunicator: (payload: {
    communicator: any;
    tempId: string;
  }) => Promise<any>;
  createRemoteBoard: (payload: { board: any; tempId: string }) => Promise<any>;
}

const CreateCommunicatorModal: React.FC<CreateCommunicatorModalProps> = ({
  open,
  onClose,
  onCreated,
  createRemoteCommunicator,
  createRemoteBoard,
}) => {
  const intl = useIntl();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string | undefined> => {
    if (!imageFile) return undefined;
    const formData = new FormData();
    formData.append('file', imageFile);
    const { data } = await apiClient.post('/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return (data as any)?.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || loading) return;

    setLoading(true);
    try {
      const captionUrl = await uploadImage();

      const tempBoardId = `board-${Date.now()}`;
      const rootBoard = await createRemoteBoard({
        board: {
          id: tempBoardId,
          name: name.trim(),
          tiles: [],
          isPublic: false,
          description: description.trim() || '',
        } as any,
        tempId: tempBoardId,
      });

      const tempCommId = `comm-${Date.now()}`;
      const created = await createRemoteCommunicator({
        communicator: {
          name: name.trim(),
          description: description.trim() || '',
          caption: captionUrl || '',
          rootBoard: rootBoard.id || rootBoard._id,
          boards: [rootBoard.id || rootBoard._id],
        },
        tempId: tempCommId,
      });

      setName('');
      setDescription('');
      setImagePreview(null);
      setImageFile(null);
      onCreated(created.id || created._id);
    } catch (error) {
      console.error('Failed to create communicator:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setName('');
    setDescription('');
    setImagePreview(null);
    setImageFile(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{intl.formatMessage(localMessages.title)}</DialogTitle>
        <DialogContent>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 16,
              marginTop: 8,
            }}
          >
            <IconButton
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              sx={{
                width: 72,
                height: 72,
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
              }}
              aria-label={intl.formatMessage(localMessages.addImage)}
            >
              {imagePreview ? (
                <Avatar
                  src={imagePreview}
                  variant="rounded"
                  sx={{ width: 64, height: 64 }}
                />
              ) : (
                <AddPhotoAlternateIcon fontSize="large" color="action" />
              )}
            </IconButton>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageSelect}
            />
          </div>

          <TextField
            autoFocus
            margin="dense"
            label={intl.formatMessage(localMessages.nameLabel)}
            placeholder={intl.formatMessage(localMessages.namePlaceholder)}
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
          <TextField
            margin="dense"
            label={intl.formatMessage(localMessages.descriptionLabel)}
            fullWidth
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            {intl.formatMessage(localMessages.cancel)}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !name.trim()}
          >
            {loading
              ? intl.formatMessage(localMessages.creating)
              : intl.formatMessage(localMessages.create)}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateCommunicatorModal;
