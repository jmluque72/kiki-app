import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { apiClient } from '../src/services/api';

interface AddAssociationPopupProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (data: {
    tipo: string;
    institucion: string;
    division: string;
    dniAlumno: string;
  }) => void;
}

const AddAssociationPopup: React.FC<AddAssociationPopupProps> = ({ visible, onClose, onAdd }) => {
  const [tipo, setTipo] = useState('');
  const [institucion, setInstitucion] = useState('');
  const [division, setDivision] = useState('');
  const [dniAlumno, setDniAlumno] = useState('');
  
  // Estados para los combos
  const [accounts, setAccounts] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Cargar accounts cuando se abre el popup
  useEffect(() => {
    if (visible) {
      loadAccounts();
    }
  }, [visible]);

  // Cargar grupos cuando se selecciona una account
  useEffect(() => {
    if (selectedAccountId) {
      loadGroups(selectedAccountId);
    } else {
      setGroups([]);
      setSelectedGroupId('');
    }
  }, [selectedAccountId]);

  const loadAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const response = await apiClient.get('/accounts');
      if (response.data.success) {
        setAccounts(response.data.data.accounts || []);
      }
    } catch (error) {
      console.error('Error cargando accounts:', error);
      console.log('Error: No se pudieron cargar las instituciones');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const loadGroups = async (accountId: string) => {
    setLoadingGroups(true);
    try {
      const response = await apiClient.get(`/grupos?cuentaId=${accountId}`);
      if (response.data.success) {
        setGroups(response.data.data.grupos || []);
      }
    } catch (error) {
      console.error('Error cargando grupos:', error);
      console.log('Error: No se pudieron cargar las divisiones');
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleAccountChange = (accountId: string) => {
    setSelectedAccountId(accountId);
    const selectedAccount = accounts.find(acc => acc._id === accountId);
    setInstitucion(selectedAccount?.nombre || '');
  };

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId);
    const selectedGroup = groups.find(group => group._id === groupId);
    setDivision(selectedGroup?.nombre || '');
  };

  const handleAdd = () => {
    if (!tipo.trim() || !selectedAccountId || !selectedGroupId || !dniAlumno.trim()) {
      console.log('Error: Por favor completa todos los campos');
      return;
    }

    onAdd({
      tipo: tipo.trim(),
      institucion: institucion.trim(),
      division: division.trim(),
      dniAlumno: dniAlumno.trim()
    });

    // Limpiar campos
    setTipo('');
    setInstitucion('');
    setDivision('');
    setDniAlumno('');
    setSelectedAccountId('');
    setSelectedGroupId('');
    setGroups([]);
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <Text style={styles.title}>Agregar Nueva Asociación</Text>
          
          <ScrollView style={styles.formContainer}>
            <View style={styles.field}>
              <Text style={styles.label}>TIPO</Text>
              <View style={styles.comboContainer}>
                <ScrollView style={styles.comboScroll} horizontal showsHorizontalScrollIndicator={false}>
                  {['coordinador', 'tutor', 'familiar'].map((tipoOption) => (
                    <TouchableOpacity
                      key={tipoOption}
                      style={[
                        styles.comboOption,
                        tipo === tipoOption && styles.comboOptionSelected
                      ]}
                      onPress={() => setTipo(tipoOption)}
                    >
                      <Text style={[
                        styles.comboOptionText,
                        tipo === tipoOption && styles.comboOptionTextSelected
                      ]}>
                        {tipoOption.charAt(0).toUpperCase() + tipoOption.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>INSTITUCIÓN</Text>
              <View style={styles.comboContainer}>
                {loadingAccounts ? (
                  <Text style={styles.loadingText}>Cargando instituciones...</Text>
                ) : (
                  <ScrollView style={styles.comboScroll} horizontal showsHorizontalScrollIndicator={false}>
                    {accounts.map((account) => (
                      <TouchableOpacity
                        key={account._id}
                        style={[
                          styles.comboOption,
                          selectedAccountId === account._id && styles.comboOptionSelected
                        ]}
                        onPress={() => handleAccountChange(account._id)}
                      >
                        <Text style={[
                          styles.comboOptionText,
                          selectedAccountId === account._id && styles.comboOptionTextSelected
                        ]}>
                          {account.nombre}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>DIVISIÓN</Text>
              <View style={styles.comboContainer}>
                {!selectedAccountId ? (
                  <Text style={styles.placeholderText}>Selecciona una institución primero</Text>
                ) : loadingGroups ? (
                  <Text style={styles.loadingText}>Cargando divisiones...</Text>
                ) : (
                  <ScrollView style={styles.comboScroll} horizontal showsHorizontalScrollIndicator={false}>
                    {groups.map((group) => (
                      <TouchableOpacity
                        key={group._id}
                        style={[
                          styles.comboOption,
                          selectedGroupId === group._id && styles.comboOptionSelected
                        ]}
                        onPress={() => handleGroupChange(group._id)}
                      >
                        <Text style={[
                          styles.comboOptionText,
                          selectedGroupId === group._id && styles.comboOptionTextSelected
                        ]}>
                          {group.nombre}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>DNI DEL ALUMNO</Text>
              <TextInput
                style={styles.input}
                value={dniAlumno}
                onChangeText={setDniAlumno}
                placeholder="DNI del alumno"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <Text style={styles.addButtonText}>Agregar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    margin: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    maxHeight: 400,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0E5FCE',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F9F9F9',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#0E5FCE',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Estilos para los combos
  comboContainer: {
    minHeight: 50,
    justifyContent: 'center',
  },
  comboScroll: {
    maxHeight: 50,
  },
  comboOption: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  comboOptionSelected: {
    backgroundColor: '#0E5FCE',
    borderColor: '#0E5FCE',
  },
  comboOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  comboOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default AddAssociationPopup; 