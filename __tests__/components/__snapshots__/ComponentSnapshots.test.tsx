import React from 'react';
import renderer from 'react-test-renderer';
import { ThemeProvider } from '../../src/contexts/ThemeContext';
import { ActivityCard } from '../../src/components/ActivityCard';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Activity } from '../../src/types/activity';

// Mock de dependencias
jest.mock('../../src/services/mediaService', () => ({
  mediaService: {
    getMediaUrl: jest.fn((filename) => `https://mock-url.com/${filename}`),
  },
}));

describe('Snapshot Tests', () => {
  describe('ActivityCard', () => {
    const mockActivity: Activity = {
      _id: '1',
      title: 'Actividad de Prueba',
      description: 'Esta es una actividad de prueba',
      date: '2024-01-15',
      time: '14:30',
      location: 'Sala de Reuniones',
      type: 'reunion',
      images: ['image1.jpg'],
      videos: [],
      attendees: ['user1', 'user2'],
      maxAttendees: 20,
      isVirtual: false,
      createdBy: 'admin1',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-10T15:30:00Z',
    };

    it('debe coincidir con el snapshot predeterminado', () => {
      const tree = renderer
        .create(
          <ThemeProvider>
            <ActivityCard
              activity={mockActivity}
              onPress={jest.fn()}
              onEdit={jest.fn()}
              onDelete={jest.fn()}
              onAttend={jest.fn()}
              currentUserId="user1"
            />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot de actividad virtual', () => {
      const virtualActivity = { ...mockActivity, isVirtual: true };
      const tree = renderer
        .create(
          <ThemeProvider>
            <ActivityCard
              activity={virtualActivity}
              onPress={jest.fn()}
              onEdit={jest.fn()}
              onDelete={jest.fn()}
              onAttend={jest.fn()}
              currentUserId="user1"
            />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot cuando el usuario ya está inscrito', () => {
      const tree = renderer
        .create(
          <ThemeProvider>
            <ActivityCard
              activity={mockActivity}
              onPress={jest.fn()}
              onEdit={jest.fn()}
              onDelete={jest.fn()}
              onAttend={jest.fn()}
              currentUserId="user1" // user1 está en attendees
            />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot cuando el usuario no está inscrito', () => {
      const tree = renderer
        .create(
          <ThemeProvider>
            <ActivityCard
              activity={mockActivity}
              onPress={jest.fn()}
              onEdit={jest.fn()}
              onDelete={jest.fn()}
              onAttend={jest.fn()}
              currentUserId="user999" // user999 no está en attendees
            />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot en estado de carga', () => {
      const tree = renderer
        .create(
          <ThemeProvider>
            <ActivityCard
              activity={mockActivity}
              onPress={jest.fn()}
              onEdit={jest.fn()}
              onDelete={jest.fn()}
              onAttend={jest.fn()}
              currentUserId="user1"
              isLoading={true}
            />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot con estilos personalizados', () => {
      const customStyles = {
        container: { backgroundColor: '#f0f0f0' },
        title: { color: '#ff0000' },
      };

      const tree = renderer
        .create(
          <ThemeProvider>
            <ActivityCard
              activity={mockActivity}
              onPress={jest.fn()}
              onEdit={jest.fn()}
              onDelete={jest.fn()}
              onAttend={jest.fn()}
              currentUserId="user1"
              customStyles={customStyles}
            />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot sin imágenes', () => {
      const activityWithoutImages = { ...mockActivity, images: [] };
      const tree = renderer
        .create(
          <ThemeProvider>
            <ActivityCard
              activity={activityWithoutImages}
              onPress={jest.fn()}
              onEdit={jest.fn()}
              onDelete={jest.fn()}
              onAttend={jest.fn()}
              currentUserId="user1"
            />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot con muchos asistentes', () => {
      const activityWithManyAttendees = {
        ...mockActivity,
        attendees: Array(15).fill('user'),
        maxAttendees: 20,
      };

      const tree = renderer
        .create(
          <ThemeProvider>
            <ActivityCard
              activity={activityWithManyAttendees}
              onPress={jest.fn()}
              onEdit={jest.fn()}
              onDelete={jest.fn()}
              onAttend={jest.fn()}
              currentUserId="user1"
            />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot con actividad completa', () => {
      const fullActivity = {
        ...mockActivity,
        attendees: Array(20).fill('user'), // Lleno
        maxAttendees: 20,
      };

      const tree = renderer
        .create(
          <ThemeProvider>
            <ActivityCard
              activity={fullActivity}
              onPress={jest.fn()}
              onEdit={jest.fn()}
              onDelete={jest.fn()}
              onAttend={jest.fn()}
              currentUserId="user999" // No inscrito
            />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });
  });

  describe('Button', () => {
    it('debe coincidir con el snapshot de botón primario', () => {
      const tree = renderer
        .create(
          <ThemeProvider>
            <Button title="Click me" onPress={jest.fn()} variant="primary" />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot de botón secundario', () => {
      const tree = renderer
        .create(
          <ThemeProvider>
            <Button title="Click me" onPress={jest.fn()} variant="secondary" />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot de botón deshabilitado', () => {
      const tree = renderer
        .create(
          <ThemeProvider>
            <Button title="Click me" onPress={jest.fn()} disabled={true} />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot de botón de carga', () => {
      const tree = renderer
        .create(
          <ThemeProvider>
            <Button title="Click me" onPress={jest.fn()} loading={true} />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot de botón con icono', () => {
      const tree = renderer
        .create(
          <ThemeProvider>
            <Button
              title="Click me"
              onPress={jest.fn()}
              icon="heart"
              iconPosition="left"
            />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot de botón pequeño', () => {
      const tree = renderer
        .create(
          <ThemeProvider>
            <Button title="Click me" onPress={jest.fn()} size="small" />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot de botón grande', () => {
      const tree = renderer
        .create(
          <ThemeProvider>
            <Button title="Click me" onPress={jest.fn()} size="large" />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot de botón outline', () => {
      const tree = renderer
        .create(
          <ThemeProvider>
            <Button title="Click me" onPress={jest.fn()} variant="outline" />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot de botón con borde redondeado', () => {
      const tree = renderer
        .create(
          <ThemeProvider>
            <Button title="Click me" onPress={jest.fn()} rounded={true} />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });
  });

  describe('Input', () => {
    it('debe coincidir con el snapshot de input básico', () => {
      const tree = renderer
        .create(
          <ThemeProvider>
            <Input
              placeholder="Enter text"
              value=""
              onChangeText={jest.fn()}
            />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot de input con valor', () => {
      const tree = renderer
        .create(
          <ThemeProvider>
            <Input
              placeholder="Enter text"
              value="Hello World"
              onChangeText={jest.fn()}
            />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot de input con etiqueta', () => {
      const tree = renderer
        .create(
          <ThemeProvider>
            <Input
              label="Username"
              placeholder="Enter username"
              value=""
              onChangeText={jest.fn()}
            />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot de input con error', () => {
      const tree = renderer
        .create(
          <ThemeProvider>
            <Input
              placeholder="Enter text"
              value=""
              onChangeText={jest.fn()}
              error="This field is required"
            />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot de input deshabilitado', () => {
      const tree = renderer
        .create(
          <ThemeProvider>
            <Input
              placeholder="Enter text"
              value=""
              onChangeText={jest.fn()}
              disabled={true}
            />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot de input seguro (password)', () => {
      const tree = renderer
        .create(
          <ThemeProvider>
            <Input
              placeholder="Enter password"
              value="password123"
              onChangeText={jest.fn()}
              secureTextEntry={true}
            />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot de input con icono', () => {
      const tree = renderer
        .create(
          <ThemeProvider>
            <Input
              placeholder="Enter text"
              value=""
              onChangeText={jest.fn()}
              leftIcon="user"
            />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot de input multilínea', () => {
      const tree = renderer
        .create(
          <ThemeProvider>
            <Input
              placeholder="Enter text"
              value=""
              onChangeText={jest.fn()}
              multiline={true}
              numberOfLines={4}
            />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot de input con diferentes tamaños', () => {
      const smallTree = renderer
        .create(
          <ThemeProvider>
            <Input
              placeholder="Small"
              value=""
              onChangeText={jest.fn()}
              size="small"
            />
          </ThemeProvider>
        )
        .toJSON();

      const largeTree = renderer
        .create(
          <ThemeProvider>
            <Input
              placeholder="Large"
              value=""
              onChangeText={jest.fn()}
              size="large"
            />
          </ThemeProvider>
        )
        .toJSON();

      expect(smallTree).toMatchSnapshot();
      expect(largeTree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot de input con borde redondeado', () => {
      const tree = renderer
        .create(
          <ThemeProvider>
            <Input
              placeholder="Enter text"
              value=""
              onChangeText={jest.fn()}
              rounded={true}
            />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot de input con fondo personalizado', () => {
      const tree = renderer
        .create(
          <ThemeProvider>
            <Input
              placeholder="Enter text"
              value=""
              onChangeText={jest.fn()}
              backgroundColor="#f0f0f0"
            />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });
  });

  describe('Snapshots con diferentes temas', () => {
    it('debe coincidir con el snapshot en tema claro', () => {
      const tree = renderer
        .create(
          <ThemeProvider theme="light">
            <Button title="Button" onPress={jest.fn()} />
            <Input placeholder="Input" value="" onChangeText={jest.fn()} />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot en tema oscuro', () => {
      const tree = renderer
        .create(
          <ThemeProvider theme="dark">
            <Button title="Button" onPress={jest.fn()} />
            <Input placeholder="Input" value="" onChangeText={jest.fn()} />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });
  });

  describe('Snapshots de componentes con animaciones', () => {
    it('debe coincidir con el snapshot de botón con animación de carga', () => {
      const tree = renderer
        .create(
          <ThemeProvider>
            <Button
              title="Loading"
              onPress={jest.fn()}
              loading={true}
              animation="pulse"
            />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('debe coincidir con el snapshot de input con animación de error', () => {
      const tree = renderer
        .create(
          <ThemeProvider>
            <Input
              placeholder="Input"
              value=""
              onChangeText={jest.fn()}
              error="Error message"
              errorAnimation="shake"
            />
          </ThemeProvider>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });
  });
});